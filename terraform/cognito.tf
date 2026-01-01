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

# Client = application, is not a person, is registered in Cognito, and asks for the token for the user
# User = person registered in the user pool, a real person

# ----------------------

# USER POOL

resource "aws_cognito_user_pool" "user_pool" {
  name = "ai-coach-user-pool"

  username_attributes      = ["email"] # email will be the identifier of the user
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
    minimum_length    = 8
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

  generate_secret = false # Cognito has to speak with the app (the client), now there can be other apps and not just my frontend trying to connect to cognito and log people, therefore cognito gives to the app a passowrd



  # since my frontend is in the browser of the user, the user can see everything, so there's no need of a password for the frontend in the browser 
  # explicit_auth_flows --> how the client authenticates within the app



  explicit_auth_flows = [ # all the methods the client is authorised to authenticate with the app, so which types of login are accepted for this client
    # "ALLOW_USER_PASSWORD_AUTH",         # browser takes email and password, sends it to cognito and cognito verifies and answer (more risky, credentials move on the internet)
    "ALLOW_REFRESH_TOKEN_AUTH", # it allows the user to remain logged in the time --> access token after a bit expires, you do not remain logged for ever, every time one token expires frontend gets a new one
    # "ALLOW_USER_SRP_AUTH"                 # browser does not send the password, is the safest
  ]

  # allowed_oauth --> how the client gets the token
  # OAuth = is a protocol that allows an app (client) to get token from an identity provider without managing a password
  # the different actors here are:
  # 1. User = person
  # 2. Client = app (frontend)
  # 3. Auth Server = Cognito
  # 4. Backend

  # without OAuth --> frontend should do eevrything, from take email and password, send them to server, manage safety etc --> too risky
  # with OAuth --> frontend does not see the password, Cognito authenticates the user, frontend just receives token

  allowed_oauth_flows_user_pool_client = true     # I'm authorising the client to use OAuth 2.0 with the User Pool
  allowed_oauth_flows                  = ["code"] # Which OAuth flow is authorised? --> Authorisation Code Flow 

  # PROCESS:
  # the user is on the frontend, clicks to login, JavaScript in the app exceutes a row, which changes the address of the page, the browser quits the app, loads a new HTML page which arrives from the Cognito server
  # this new page is not part of my frontend, the user writes its email and password, then the browser sends those data to Cognito, my app does not receive or see anything. 
  # AUTHORISATION CODE FLOW:
  # Cognito verify user's credentials, if authenticated Cognito tells to the browser (redirect) to go back to the app and bring a specific CODE
  # Browser goes back to the app, reload the app with the CODE in the URL
  # the App reads the code, send a request to Cognito and exchanges this CODE with the token

  # OAuth/Authorisation = when 

  allowed_oauth_scopes = ["email", "openid", "profile"] # just tells which data have to be included in the token that cognito exchanges with the app

  # openid + OAuth is what enables OpenID Connect adding identity (Token) --> when the OAuth is used to send the token to the frontend, openid is the id which says who is the user, add identity. Without it there is still no concept of logged user.

  callback_urls = [          # this is where Cognito sends the browser after the login, for example when it does the redirect to go back to the app
    "http://localhost:3000", # the server on this device --> this is for dev, not prod
    "https://**************************.com"
  ]

  logout_urls = ["http://localhost:3000"] # this is instead where cognito sends browsera fter loggout

}
