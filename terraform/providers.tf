# Here I tell Terraform I use the AWS provider and which region to use.
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws" # provider source on the Terraform Registry (published by HashiCorp)
      version = "~> 5.0"        # allow any 5.x version, but avoid automatic upgrade to 6.x
    }
  }
}
# Dependencies block


provider "aws" {
  region = "eu-west-2"
  assume_role {
    role_arn = "arn:aws:iam::946700825722:role/AdminRole"
    session_name = "terraform"
  }
}

# Provider block

# When there's the = it means it can be a map or an object (it's like a Python dict)
# The difference is that the values in the Map are of the same type, the ones in the object are different type (e.g. numbers and string)
# Make sure role I'm using has in its trust relationship CLI, and that CLI allows the Role.
# Security --> using a role instead of directly CLI/users I have more security because STS
# Security Token Service provides temporary credentials for limited time that Terraform can use to create resources and connect with APIs
# When time finishes the credentials expire without exposing the permanent ones of the users
# Everything is logged in cloudtrail under the session "terraform"