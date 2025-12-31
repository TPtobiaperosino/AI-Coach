# it's both identity and targets provider
# There are two concetps Cognito offers:
# 1. User Pool --> users authentication and login (authentication)
# 2. Identity Pool --> provides credentials to aws (authorization)

# I choose 1 because I don't need AIM authorisation management or assign
# IAM temporary credentials, I just need to manager login/signup.

# JWT = JSON Web Token --> is a string which includes data --> it is a string in the HTTP request
# in the JWT there are: 
# A. Header
# B. Payload (CLAIMS) --> sub, email ecc
# C. Cognito signature

# In Cognito there are:
# 1. User Pool --> "users database"
# 2. App Client --> application authorised to use that pool

# when a user authenticates successfully cognito generates a token (JWT) which is basically a string aws signed and it goes in the browser and is saved by the frontend.
# every time frintend calls backend the token goes into the header of the HTTP request, and the backend let the user pass without password

# ----------------------

# USER POOL

resource "aws_cognito_user_pool" "user_pool" {
    name = "ai-coach-user-pool"

    username_attributes = ["email"]  # email will be the identifier of the user
    auto_verified_attributes = ["email"] # the attribute to be verified will be the email

      schema {
    name                = "targetCalories"
    attribute_data_type = "Number"
    mutable             = true
    required            = false
  }

  schema {
    name                = "targetProtein"
    attribute_data_type = "Number"
    mutable             = true
    required            = false
  }

  schema {
    name                = "targetCarbs"
    attribute_data_type = "Number"
    mutable             = true
    required            = false
  }

  schema {
    name                = "targetFat"
    attribute_data_type = "Number"
    mutable             = true
    required            = false
  }

  password_policy {
  minimum_length    = 4
  require_lowercase = false
  require_uppercase = false
  require_numbers   = false
  require_symbols   = false
}

}

# -----------------------------

# APP CLIENT

resource "aws_cognito_user_pool_client" "frontend" {
  name = "ai-coach-frontend-client"
  user_pool_id = aws_cognito_user_pool.user_pool.id

  generate_secret = false # Cognito has to speak with the app and has to know who has to log (the client), now there can be other apps and not just my frontend trying to connect to cognito and log people, therefore cognito gives to the app a passowrd
 # since my frontend is in the browser of the user, the user can see everything, so there's no need of a password for the frontend in the browser
  
  explicit_auth_flows = [       # all the methods the client is authorised to authenticate with the app, so which types of login are accepted for this client
  # "ALLOW_USER_PASSWORD_AUTH",   # browser takes email and password, sends it to cognito and cognito verifies and answer (more risky, credentials move on the internet)
  "ALLOW_REFRESH_TOKEN_AUTH",   # it allows the user to remain logged in the time --> access token after a bit expires, you do not remain logged for ever, every time one token expires frontend gets a new one
  "ALLOW_USER_SRP_AUTH"         # browser does not send the password, is the safest
  ]

}
