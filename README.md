## Overview
Public GitHub repo for an AI meal coach: users upload meal photos, get nutrition estimates and recommendations.

## Use Case
- User logs in via Cognito Hosted UI (auth code flow).
- Uploads a meal photo; backend analyses it with Bedrock and returns calories/macros/summary.
- User can view past meals with images and AI analysis.

## How It Works
- Frontend: Next.js (Amplify-hosted from GitHub `main`). Login page generates `state`, Cognito redirects back with `code`; callback exchanges code→JWT, stores tokens in `localStorage`, routes to `/home`.
- API: API Gateway HTTP API with Cognito JWT authorizer. Routes: `POST /presign`, `GET /meals`.
- Presign: Lambda creates `uploadId`, S3 key `uploads/{userId}/{uploadId}.jpg`, writes item to DynamoDB (status `UPLOADING`, 24h TTL), returns presigned PUT URL.
- Upload: Browser PUTs the image directly to S3 via the presigned URL (no API Gateway).
- Processing: S3 ObjectCreated triggers Lambda processor; it downloads the image, calls Bedrock `converse` (image bytes + prompt), stores analysis/status (`PROCESSED`/`FAILED`) in DynamoDB.
- Read: Lambda read queries DynamoDB for the user’s items, generates presigned GET URLs, returns `{items: [...]}`; the browser displays images via those URLs.
- Data/Infra: S3 bucket (lifecycle/CORS/public access block), DynamoDB table `ai-fitness-coach-recommendations` (PK/SK), Lambda IAM role with S3/DynamoDB/Bedrock/CloudWatch, resource policies for API Gateway and S3 triggers.
- CI/CD: Amplify builds/deploys the frontend from this public GitHub repo; Terraform manages Cognito, API Gateway, Lambdas, S3, DynamoDB, Amplify config.
