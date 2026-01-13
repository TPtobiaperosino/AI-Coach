#here I can define the varaibles I want to change without touching the code, and I make the deploy repeatible

variable "bedrock_model_id" {
  description = "Bedrock model ID used by the processor Lambda (on-demand capable by default)"
  type        = string
  default     = "anthropic.claude-3-sonnet-20240229-v1:0"
}

variable "bedrock_inference_profile_arn" {
  description = "Optional Bedrock inference profile ARN (use this when invoking models like Nova that require an inference profile). Leave blank to use modelId."
  type        = string
  default     = ""
}
variable "github_token" {
  description = "GitHub Personal Access Token for Amplify"
  type        = string
  sensitive   = true
}
