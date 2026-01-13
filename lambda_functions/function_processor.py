import boto3
import os
import json
import logging
from urllib.parse import unquote_plus
from botocore.config import Config
from json import JSONDecodeError

# Initialize Clients
s3 = boto3.client("s3")
bedrock = boto3.client(
   "bedrock-runtime",
   config=Config(retries={"max_attempts": 1, "mode": "standard"})
)
dynamodb = boto3.resource("dynamodb")

TABLE_NAME = os.environ["TABLE_NAME"]
MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")
recommendations_table = dynamodb.Table(TABLE_NAME)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_json_from_text(text: str):
   """
   Bedrock sometimes returns plain text with JSON inside; try direct parse first,
   otherwise extract the first {...} block to avoid crashing the processor.
   """
   try:
      return json.loads(text)
   except JSONDecodeError:
      start = text.find("{")
      end = text.rfind("}")
      if start != -1 and end != -1 and end > start:
         return json.loads(text[start : end + 1])
      raise

def handler(event, context):
   # 1. Extract info from S3 Event
   record = event["Records"][0]
   bucket = record["s3"]["bucket"]["name"]
   s3_key = unquote_plus(record["s3"]["object"]["key"])
   
   # Parse IDs from Key: uploads/{user_id}/{upload_id}.jpg
   parts = s3_key.split("/")
   user_id = parts[-2]
   filename = parts[-1]
   upload_id = os.path.splitext(filename)[0]
   img_format = "jpeg" if filename.lower().endswith((".jpg", ".jpeg")) else "png"

   try:
      # 2. Download Image
      s3_request = s3.get_object(Bucket=bucket, Key=s3_key)
      image_bytes = s3_request["Body"].read()

      # 3. Mark as PROCESSING in DynamoDB
      recommendations_table.update_item(
         Key={"PK": f"USER_{user_id}", "SK": f"UPLOAD_{upload_id}"},
         UpdateExpression="SET #s = :s",
         ExpressionAttributeNames={"#s": "status"},
         ExpressionAttributeValues={":s": "PROCESSING"}
      )

      # 4. Call Bedrock for AI Analysis
      prompt = "Return ONLY valid JSON: {\"estimatedCalories\": number, \"protein_g\": number, \"carbs_g\": number, \"fat_g\": number, \"mealScore\": number, \"summary\": string}"
      
      response = bedrock.converse(
         modelId=MODEL_ID,
         messages=[{
            "role": "user",
            "content": [
               {"image": {"format": img_format, "source": {"bytes": image_bytes}}},
               {"text": prompt}
            ]
         }],
         inferenceConfig={"maxTokens": 300, "temperature": 0.1}
      )

      # 5. Parse AI Response
      output_text = response["output"]["message"]["content"][0]["text"]
      analysis = parse_json_from_text(output_text) #convert the JSON string in a python dict

      # 6. Save Results & Set status to PROCESSED
      recommendations_table.update_item(
         Key={"PK": f"USER_{user_id}", "SK": f"UPLOAD_{upload_id}"},
         UpdateExpression="SET #s = :s, analysis = :a",
         ExpressionAttributeNames={"#s": "status"},
         ExpressionAttributeValues={":s": "PROCESSED", ":a": analysis}
      )

   except Exception as e:
      logger.exception("Processing failed")
      try:
         recommendations_table.update_item(
            Key={"PK": f"USER_{user_id}", "SK": f"UPLOAD_{upload_id}"},
            UpdateExpression="SET #s = :s, errorMsg = :e",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":s": "FAILED", ":e": str(e)}
         )
      except:
         logger.error("Could not update DynamoDB with FAILED status")
