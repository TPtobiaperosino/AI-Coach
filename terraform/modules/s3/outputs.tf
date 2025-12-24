output "bucket_arn" {
    value = aws_s3_bucket.uploads.arn   # I need arn when I set up policies/IAM authotisations
}

output "bucket_name" {
    value = aws_s3_bucket.uploads.id   # I need it for s3 operations
}