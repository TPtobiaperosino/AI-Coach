resource "aws_s3_bucket" "uploads" {
    bucket = "s3-uploads-ai-running-coach-tobia"
}

resource "aws_s3_bucket_lifecycle_configuration" "lifecycle_uploads" {
    bucket = aws_s3_bucket.uploads.id # this is the id of the bucket as resource, arn is for policies

    rule {
        id = "delete-expired-uploads" # this is the id of the rule
        status = "Enabled"
        filter {prefix = "uploads/"}
        expiration {days = 3}
    }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
    bucket = aws_s3_bucket.uploads.id

    block_public_acls       = true
    block_public_policy     = true    # prevent any public policies that could make the bucket public
    ignore_public_acls      = true    # ignore any existing acls
    restrict_public_buckets = true    # further protection
}

# ACL = Access Control List --> who can access the bucket or an object + which permissions there are