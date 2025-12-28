output "bucket_arn" {
    value = aws_s3_bucket.uploads.arn   # I need arn when I set up policies/IAM authotisations
}

output "bucket_name" {
    value = aws_s3_bucket.uploads.id   # I need it for s3 operations
}


# these are just two ways to refer to the s3 bucket
# id is for s3 operations, ARN is for IAM policies --> bucket name = id since it's globally unique, but is an exception for s3