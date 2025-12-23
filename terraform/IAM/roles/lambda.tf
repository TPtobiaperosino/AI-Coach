# Roles HAVE TRUST RELATIONSHIPS THAT SET WHO CAN USE THEM
# Also USERS HAVE TO HAVE PERMISSIONS TO ASSUME ROLES

# first thing I need to do is to create an IAM role that the Lambda can use.
# terraform resources always follow this structure: "provider_type" "local_name"
# the local name is just in terraform, so is up to me, is like a variable
# Lambda need this role to receive then temporary permissions
# the name is instead what I see in the console when watching the IAM role, that is the the AWS real resource
# in aws avery entity that execute actions has to have a role (an identity)

resource "aws_iam_role" "lambda_role" {
    name = "ai-coach-lambda-role"       # name that is in the console


# assume_role_policy is the trust policy of the role and says who can assume that role. It is an attribute of the role.
# this role will be used only by lambda
# sto dicendo che a lambda e' permesso di assumere il ruolo

assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = { Service = "lambda.amazonaws.com" } # Trust policies set who can assume the role, so they have a principal
    }]                                                   # Principal is like saying "who"? Resource is "what"?
})
}

# --------------------------------------------------------------

#  Now I'll attach a policy (aws managed) to the role to allow then Lmabda, when assumes this role, to access logs in cloudwatch
#  CloudWatch role permission

resource "aws_iam_role_policy_attachment" "lambda_logs_attach" {
    role = aws_iam_role.lambda_role.name          # here I could also use "ai-coach-lambda-role", but is not best practice, if I then chance the name I brake terraform
    policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# --------------------------------------------------------------

#  S3 access permission policy (created by myself) + attach it to the role

resource "aws_iam_policy" "permission_policy_lambda_s3_access" {
    name = "permission-policy-ai-coach-lambda-s3-access"

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
            Sid = "ListBucket"                 
            Effect = "Allow"
            Action = ["s3:ListBucket"]      # First I need to give permission to the Lambda role to look at the names (keys) of the objects in the bucket
            Resource = aws_s3_bucket.uploads.arn  # no principal but I need the what, at which resource am I refferring
            },  # Resource is = to a single element, and not a list, because we are referring just to the bucket
            {
            Sid = "ObjectOps"
            Effect = "Allow"
            Action = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"] #read, add and delete objects from bucket
            Resource = ["${aws_s3_bucket.uploads.arn}/*"] # list becasue I could include more prefix
                                        #IT IS PROBABLY TOO PERMISSIVE --> I'm including all the objects in the bucket and not specifying the prefix
            }                           # * means consider everything in the path until /, $ is to replace the path with the corresponding arn adress 
        ]                               # Not using the $ and putting directly the arn adress is not sustainable over time, if I change the name of the bucket the architecture stops working
    })
}

# now I can assign the policy just created to the role

resource "aws_iam_role_policy_attachment" "lambda_s3_attach" {
    role = aws_iam_role.lambda_role.name
    policy_arn = aws_iam_policy.permission_policy_lambda_s3_access.arn
}