resource "aws_lambda_function" "read" {
  function_name = "ai-coach-read"
  role          = aws_iam_role.lambda_role.arn
  runtime       = "python3.12"
  handler       = "function_read.handler"

  filename         = "../lambda_functions/read.zip"                   # this says to terraform --> when you create/update the lambda use this file as code/function
  source_code_hash = filebase64sha256("../lambda_functions/read.zip") # file() reads file byte per byte, sha256 produces the hash in bytes, base64 transforms bytes in string. 

  environment {
    variables = {
      UPLOADS_BUCKET = module.uploads_s3.bucket_name # --> I need to define this as a variable because python cannot read terraform, so at runtime level I need a way to refer to the bucket
      TABLE_NAME     = aws_dynamodb_table.recommendations.name
    }
  }
  timeout = 30
}