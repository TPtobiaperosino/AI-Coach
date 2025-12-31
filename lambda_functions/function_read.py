# this lambda will provide to the user the possibility to download recommendations and corresponding images
# Lambda read --> read user id from jwt --> query dynamodb --> generate get presigned url --> provide both to the frontend

import boto3
import os
import json
from boto3.dynamodb.conditions import Key # I need it to build KeyConditionExpression

s3 = boto3.client("s3") 
dynamodb = boto3.resource("dynamodb")

BUCKET_NAME = os.environ["UPLOADS_BUCKET"] 
TABLE_NAME = os.environ["TABLE_NAME"]   

recommendations_table = dynamodb.Table(TABLE_NAME) # in this way I leverage .resource creating an object to work on

def handler(event, context):
    user_id = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]

    PK_value = f"USER_{user_id}"
    SK_prefix = "RECOMMENDATION_"

    response = recommendations_table.query(     # query will give back a python dict
        KeyConditionExpression = (
            Key("PK").eq(PK_value) &
            Key("SK").begins_with(SK_prefix)
        )
    )
    
    items = response.get("Items", []) # get is a method of dict, and what I'm doing is extarcting the list of the values belonging to the Key "Items"
                                      # after this items becomes a list of dicts (each dict is an item)
                                      # if the list has values (items) --> rsult will be --> items = response["Items"]
                                      # in case the Key "Items" does not exists in the dict, this method will give back items = []
#visually response looks like this:
#response = {
#    "Items": [
#        {
#            "PK": "USER_123",
#            "SK": "RECOMMENDATION_abc123",
#            "s3_key": "uploads/123/abc123.jpg",
#            "status": "PROCESSED",
#            "createdAt": "2025-01-03T10:15:30Z",
#            "targets": {
#                "calories": 2200,
#                "protein": 160,
#                "carbs": 220,
#                "fat": 70
#            },
#            "analysis": {
#                "meal_score": 82,
#                "meal_estimate": {
#                    "calories": 650,
#                    "protein_g": 45,
#                    "carbs_g": 55,
#                    "fat_g": 22
#                },
#                "next_meal_recommendation": {
#                    "goal": "increase protein intake",
#                    "suggested_foods": ["grilled chicken", "greek yogurt"],
#                    "macro_focus": "protein"
#                }
#            }
#        },
#        {
#            "PK": "USER_123",
#            "SK": "RECOMMENDATION_def456",
#            "s3_key": "uploads/123/def456.jpg",
#            "status": "PROCESSED",
#            "createdAt": "2025-01-02T19:40:10Z",
#            "targets": {
#                "calories": 2200,
#                "protein": 160,
#                "carbs": 220,
#                "fat": 70
#            },
#            "analysis": {
#                "meal_score": 74,
#                "meal_estimate": {
#                    "calories": 540,
#                    "protein_g": 28,
#                    "carbs_g": 60,
#                    "fat_g": 18
#                },
#                "next_meal_recommendation": {
#                    "goal": "balance carbs and protein",
#                    "suggested_foods": ["salmon", "brown rice"],
#                    "macro_focus": "balanced"
#                }
#            }
#        }
#    ],
#    "Count": 2,
#    "ScannedCount": 2,
#    "ResponseMetadata": {
#        "HTTPStatusCode": 200,
#        "RequestId": "XYZ123"
#    }
#}

# now I'll use for to navigate among all the items in the Items list
    results = [] #in this way if it does not exists because for example the image has been removed, the user will see null
    for item in items:  #item can be whatever, I just put item so i clearer
        s3_key = item["s3_key"]
        download_url = None
        if s3_key is not None and s3_key != "":
            download_url = s3.generate_presigned_url(
                ClientMethod="get_object",      
                Params={                        
                    "Bucket": BUCKET_NAME,      
                    "Key": s3_key,                  
                },
                ExpiresIn=300 
            )

        results.append({ # results is a list of dicts (items) because each time the for goes ahead append stores one new dict per item in results, so in the end results will include all the dicts   
            "upload_id": item.get("SK", "").replace("RECOMMENDATION_", ""),  # I need to include get in "" becasue if it is none, since I'm applying the method replace then it crashes. With replace I remove the prefix
            "createdAt": item.get("createdAt"),
            "status": item.get("status"),
            "targets": item.get("targets"),
            "analysis": item.get("analysis"), 
            "download_url": download_url
        })

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"items": results}) #I put items so it returns the value of results with more clarity, since the word results will not be included
    }    

# what is returned to API:
# {
#  "items": [
#    {...},
#    {...}
#  ]
# }
# since list is not a list the container will be an object that's why items is included in {}, if I'd left just results the container would have been just a list.

