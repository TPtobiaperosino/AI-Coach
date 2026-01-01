# API Gateway is a HTTP router. 5 key concepts: API --> Authorizer --> integration --> route --> stage
# read the JWT to manage accesses
# route --> gives indication --> based on this METHOD and PATH you have to do these things. for example for POST and \presign --> send the s3 url to the user
# stage: makes API accessible on the internet. Every api cna have multiple stage. 

# there are also other protocols: e.g. REST, WEBSOCKET
# protocol = set of rules two computers follow to talk to each other
# server = computer system listeining for requests from other computers (clients), process them and send back answers.
# HTTP: simpler, cheaper, newer, native JWT authorizers --> method, path, protocol version, headers, body. HTTP is stateless = server does not remember anything and each request is independent. JWT allows to reintroduce myself each time.
# HTTP BECAUSE: because the backend has to answer to requests once at a time, the server has to be stateless, and that's wjy then we linl it with JWT.

# HTTP API

resource "aws_apigatewayv2_api" "http_api" {
  name          = "ai-coach-api-gateway"
  protocol_type = "HTTP"

  # CORS --> tells to the browser from which sites is possible to call this API
  # allow_origins just says which web app can call the API from the browser
  # Methods allowed: GET (read data) POST (send data) and OPTIONS ()
  # Headers: authorization (is for JWT), while content-type for application/json
  # max_age: is just for the duration of the CORS rule.
  # options: is the approval for the request the browser sends to the server before senidng the real request.

  cors_configuration {
    allow_origins = [
      "http://localhost:3000",
      "https://your-frontend-domain.com"
    ]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Authorization", "authorization", "Content-Type"]
    max_age       = 3600
  }
}

# -------------------------------------

# COGNITO JWT AUTHORIZER

resource "aws_apigatewayv2_authorizer" "cognito_jwt" {
  api_id           = aws_apigatewayv2_api.http_api.id
  name             = "cognito-jwt"
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"] # because JWT is in the header called Authorization of the HTTP request

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.frontend.id] # is referring to the app client created
    issuer   = "https://cognito-idp.eu-west-2.amazonaws.com/${aws_cognito_user_pool.user_pool.id}"
  }
}

# -------------------------------------

# LAMBDA INTEGRATIONS

resource "aws_apigatewayv2_integration" "presign" {
  api_id = aws_apigatewayv2_api.http_api.id

  integration_type       = "AWS_PROXY"                                   # --> means API Gateway sends the HTTP request to Lambda 
  integration_uri        = aws_lambda_function.presign.invoke_arn # means when the requests arrives, call this lambda
  payload_format_version = "2.0"                                         # format of the event to send to lambda. 2.0 is the format to use with http requests. 1.0 with rest API
}

resource "aws_apigatewayv2_integration" "read" {
  api_id = aws_apigatewayv2_api.http_api.id

  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.read.invoke_arn
  payload_format_version = "2.0"
}

#---------------------------------
# ROUTES

resource "aws_apigatewayv2_route" "presign" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /presign"

  target = "integrations/${aws_apigatewayv2_integration.presign.id}" # to who should it send the request

  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.cognito_jwt.id
}

resource "aws_apigatewayv2_route" "meals" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /meals"

  target = "integrations/${aws_apigatewayv2_integration.read.id}"

  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.cognito_jwt.id
}

#---------------------------------
# STAGE

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default" # --> it uses the default stage
  auto_deploy = true       # --> every edit to the route is instantly deployed
}

#---------------------------------
# Lambda Permissions

resource "aws_lambda_permission" "allow_apigw_presign" {
  statement_id  = "AllowApiGatewayInvokePresign"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.presign.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_apigw_read" {
  statement_id  = "AllowApiGatewayInvokeRead"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.read.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

# ------------------------
# Output

output "api_base_url" {
  value = aws_apigatewayv2_api.http_api.api_endpoint
}