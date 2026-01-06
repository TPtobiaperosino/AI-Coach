# here this function has to be triggered when the photo is uploaded
# has to extract the image from S3, convert from stream of bytes to base64, invoke BedRock, get the recommendation and store it in DynamoDB
# The structure of the json I receive with an S3 event
#{
#  "Records": [
#    {
#      "eventSource": "aws:s3",
#      "eventName": "ObjectCreated:Put",
#      "awsRegion": "eu-west-2",
#      "s3": {
#        "bucket": {
#          "name": "my-upload-bucket"
#        },
#        "object": {
#          "key": "uploads/user123/file.jpg",
#          "size": 123456
#        }
#      }
#    }
#  ]
#}

import boto3
import os
import json
import logging
from urllib.parse import unquote_plus
from boto3.dynamodb.conditions import Key
from datetime import datetime, timezone       # I need it to identify the exact moment when the event happened --> createdAt
                                              # from the datetime module take the class datetime. the class datetime represents a specific point in the time
from botocore.config import Config
from botocore.exceptions import ClientError

# SDK section
s3 = boto3.client("s3")
# Limit SDK retries so we fail fast on throttling (we handle it explicitly)
bedrock = boto3.client(
   "bedrock-runtime",
   config=Config(retries={"max_attempts": 1, "mode": "standard"})
)
dynamodb = boto3.resource("dynamodb")               # I use resource when I need to call API but also create objects representing the resurce and operate on it

BUCKET_NAME = os.environ["UPLOADS_BUCKET"]
TABLE_NAME = os.environ["TABLE_NAME"]                               # This is just a string, is not enough in this case because I need to create an object representation of the dynamodb table and then operate on it.
# Use original Nova Lite (not Nova 2)
MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

recommendations_table = dynamodb.Table(TABLE_NAME)                  # Here I use the TABLE_NAME to specify the Table im referring to and then to create an object representation of the table created in terraform

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def handler(event, context):        # In event I'll find a JSON with what happened in S3, because s3 event invoke this specific function
   upload = event["Records"][0]      # it's not compulsory, but better so I already defined the event in a variable. record because I need to access the list, but the list can include multiple events, so I want to make sure to extract only the first one that is the upload
   bucket = upload["s3"]["bucket"]["name"]  # in s3 every object is always identified by key + bucket
   s3_key = upload["s3"]["object"]["key"]

   # Decode URL-encoded keys to avoid NoSuchKey when S3 sends encoded keys
   s3_key = unquote_plus(s3_key)
   parts = s3_key.split("/")
   if len(parts) < 2:
       logger.error("Unexpected S3 key format: %s", s3_key)
       raise Exception("Unexpected S3 key format")

   # be robust: take the last two segments as user_id/filename
   user_id = parts[-2]
   filename = parts[-1]
   upload_id, ext = os.path.splitext(filename)
   img_format = "jpeg" if ext.lower() in [".jpg", ".jpeg"] else "png"

   try:
      s3_request = s3.get_object(Bucket=bucket, Key=s3_key)
      image_bytes = s3_request["Body"].read()
   except Exception as e:
      logger.exception("Failed to get S3 object %s/%s", bucket, s3_key)
      # Mark item as ERROR and exit (typically means the browser upload never reached S3)
      try:
         recommendations_table.update_item(
            Key={"PK": f"USER_{user_id}", "SK": f"UPLOAD_{upload_id}"},
            UpdateExpression="SET #s = :s, errorMessage = :e",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":s": "ERROR", ":e": str(e)},
         )
      except Exception:
         logger.exception("Failed to write ERROR status to DynamoDB for upload %s", upload_id)
      # exit gracefully so the lambda doesn't crash repeatedly
      return

   uploaded_item = recommendations_table.get_item(
      Key = {
         "PK": f"USER_{user_id}",
         "SK": f"UPLOAD_{upload_id}"
      }
   )

   if "Item" not in uploaded_item:
      logger.error("Uploaded context not found in the database for user_id=%s upload_id=%s", user_id, upload_id)
      try:
         recommendations_table.update_item(
            Key={"PK": f"USER_{user_id}", "SK": f"UPLOAD_{upload_id}"},
            UpdateExpression="SET #s = :s, errorMessage = :e",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":s": "ERROR", ":e": "Upload metadata not found"},
         )
      except Exception:
         logger.exception("Failed to write ERROR status to DynamoDB for missing upload %s", upload_id)
      return  # exit without raising so the invocation does not keep failing

   # CONSUMED SO FAR block removed per instructions

   recommendations_table.update_item(
      Key={       
      "PK": f"USER_{user_id}",
      "SK": f"UPLOAD_{upload_id}"
      },

# status is a reserved word in dynamodb, i cannot use it as variable, therefore I'll use an alias
# "#" before the first letter indicates it is an alias for names/variables, ":" for values
# I need to write this below becasue I want to update a field, not upload an actual item
       UpdateExpression = "SET #s = :s", # it's just a remote code in the dynamodb language to say that I want to modify that field
       ExpressionAttributeNames = {"#s": "status"},
       ExpressionAttributeValues = {":s": "PROCESSING"}
   )

   PROMPT_TEMPLATE = """Return ONLY valid JSON (no markdown, no extra text) matching exactly:
{
  \"estimatedCalories\": number,
  \"protein_g\": number,
  \"carbs_g\": number,
  \"fat_g\": number,
  \"mealScore\": number,
  \"summary\": string
}
"""

   prompt_text = PROMPT_TEMPLATE

   messages = [
      {
         "role": "user",
         "content": [
            {"image": {"format": img_format, "source": {"bytes": image_bytes}}},
            {"text": prompt_text},
         ],
      }
   ]

   output_text = ""
   try:
      converse_kwargs = {
         "modelId": MODEL_ID,
         "messages": messages,
         "inferenceConfig": {"maxTokens": 200, "temperature": 0.1},
      }

      logger.info("Invoking Bedrock model %s for upload_id=%s", MODEL_ID, upload_id)
      api_response = bedrock.converse(**converse_kwargs)

      logger.info("Bedrock returned for upload_id=%s", upload_id)
      usage = api_response.get("usage", {})
      if usage:
         logger.info(
            "Bedrock tokens used - input: %s, output: %s",
            usage.get("inputTokens", 0),
            usage.get("outputTokens", 0),
         )
      output_message = api_response.get("output", {}).get("message", {})
      content_blocks = output_message.get("content", [])
      output_text = "".join(
         block.get("text", "") for block in content_blocks if isinstance(block, dict) and block.get("text")
      ).strip()

      if not output_text:
         raise ValueError("Bedrock response contained no text content")

      result = json.loads(output_text)

   except json.JSONDecodeError:
      logger.exception("Bedrock returned non-JSON response for upload_id=%s", upload_id)
      truncated = output_text[:500] if output_text else ""
      try:
         recommendations_table.update_item(
            Key={"PK": f"USER_{user_id}", "SK": f"UPLOAD_{upload_id}"},
            UpdateExpression="SET #s = :s, analysis = :a",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={
               ":s": "FAILED",
               ":a": {"error": "Model output was not valid JSON", "rawText": truncated},
            },
         )
      except Exception:
         logger.exception("Failed to write FAILED status to DynamoDB for upload %s", upload_id)
      return
   except ClientError as e:
      error_code = e.response.get("Error", {}).get("Code", "")
      # Bedrock can return throttling for token/day or rate limits.
      if error_code == "ThrottlingException":
         logger.warning("Bedrock throttled for upload_id=%s: %s", upload_id, str(e))
         try:
            recommendations_table.update_item(
               Key={"PK": f"USER_{user_id}", "SK": f"UPLOAD_{upload_id}"},
               UpdateExpression="SET #s = :s, analysis = :a",
               ExpressionAttributeNames={"#s": "status"},
               ExpressionAttributeValues={
                  ":s": "THROTTLED",
                  ":a": {"error": "THROTTLED", "message": "Bedrock quota/rate limit reached. Try again later."},
               },
            )
         except Exception:
            logger.exception("Failed to write THROTTLED status to DynamoDB for upload %s", upload_id)
         return

      logger.exception("Bedrock client error for upload_id=%s", upload_id)
      try:
         recommendations_table.update_item(
            Key={"PK": f"USER_{user_id}", "SK": f"UPLOAD_{upload_id}"},
            UpdateExpression="SET #s = :s, analysis = :a",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":s": "FAILED", ":a": {"error": error_code, "message": str(e)}},
         )
      except Exception:
         logger.exception("Failed to write FAILED status to DynamoDB for upload %s", upload_id)
      return

   except Exception as e:
      logger.exception("Bedrock invocation failed for upload_id=%s", upload_id)
      try:
         recommendations_table.update_item(
            Key={"PK": f"USER_{user_id}", "SK": f"UPLOAD_{upload_id}"},
            UpdateExpression="SET #s = :s, analysis = :a",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":s": "FAILED", ":a": {"error": str(e)}},
         )
      except Exception:
         logger.exception("Failed to write FAILED status to DynamoDB for upload %s", upload_id)
      return

   # If result is the full model response, and you need text output from 'converse' style, adapt extraction accordingly.
   # If 'result' contains the JSON string output, parse as needed. We'll assume the model returned JSON string in result variable when using converse.

   try:
      # If the result here is already the analysis dict, use it; otherwise adapt to extract the model text.
      analysis_obj = result if isinstance(result, dict) else result

      recommendations_table.update_item(
         Key={       
         "PK": f"USER_{user_id}",
         "SK": f"UPLOAD_{upload_id}"
         },

         UpdateExpression = "SET #s = :s, analysis = :a",
         ExpressionAttributeNames = {"#s": "status"},
         ExpressionAttributeValues = {":s": "PROCESSED", ":a": analysis_obj}
      )
   except Exception:
      logger.exception("Failed to write PROCESSED status to DynamoDB for upload %s", upload_id)
      # do not raise further
      return
