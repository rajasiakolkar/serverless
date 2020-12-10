# Serverless

## Technology Stack
NodeJs

## CI/CD

Trigger the GitHub Actions workflow to build new AMI

Create infrastructure with `terraform apply`

Use the GitHub Actions workflow build to deploy new version of the app
   
Once the build is completed successfully deploying the application to the EC2 instance 
and also uploading the latest artifact in the S3 bucket, trigger the GitHub Actions workflow
to update the new version of lambda function
 