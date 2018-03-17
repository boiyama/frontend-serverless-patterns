# Use AWS

## Set-up

* Install Python
* Install AWS CLI  
  Doc: https://docs.aws.amazon.com/cli/latest/userguide/installing.html

```sh
$ pip install awscli --upgrade --user
```

* Configure AWS Credentials

```sh
$ aws configure
```

* Enable CloudFront

```sh
$ aws configure set preview.cloudfront true
```

## Configure Infrastructure

* Create S3 Bucket

```sh
$ aws s3api create-bucket --bucket [BUCKET_NAME]
```

* Create CloudFront OAI  
  Doc: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html#private-content-creating-oai

```sh
$ aws cloudfront create-cloud-front-origin-access-identity --cloud-front-origin-access-identity-config CallerReference=access-identity-[BUCKET_NAME],Comment=access-identity-[BUCKET_NAME]
...
    "CloudFrontOriginAccessIdentity": {
        "Id": "[OAI_ID]",
...
```

* Configure Bucket Policy  
  Doc: https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html#example-bucket-policies-use-case-6

```sh
$ cat > bucket-policy.json << EOF
{
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS":
          "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity [OAI_ID]"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::[BUCKET_NAME]/*"
    },
    {
      "Effect": "Allow",
      "Principal": {
        "AWS":
          "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity [OAI_ID]"
      },
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::[BUCKET_NAME]"
    }
  ]
}
EOF

$ aws s3api put-bucket-policy --bucket [BUCKET_NAME] --policy file://bucket-policy.json
```

* Create CloudFront Distribution

```sh
$ cat > distribution.json << EOF
{
  "Comment": "",
  "Origins": {
    "Items": [
      {
        "S3OriginConfig": {
          "OriginAccessIdentity":
            "origin-access-identity/cloudfront/[OAI_ID]"
        },
        "Id": "origin",
        "DomainName": "[BUCKET_NAME].s3.amazonaws.com"
      }
    ],
    "Quantity": 1
  },
  "DefaultRootObject": "index.html",
  "PriceClass": "PriceClass_All",
  "Enabled": true,
  "DefaultCacheBehavior": {
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "TargetOriginId": "origin",
    "ViewerProtocolPolicy": "allow-all",
    "ForwardedValues": {
      "Cookies": {
        "Forward": "none"
      },
      "QueryString": false
    },
    "MinTTL": 0,
    "Compress": true
  },
  "CallerReference": "distribution-[BUCKET_NAME]",
  "CustomErrorResponses": {
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200"
      }
    ],
    "Quantity": 1
  }
}
EOF

$ aws cloudfront create-distribution --distribution-config file://distribution.json
...
    "Distribution": {
...
        "DomainName": "[DISTRIBUTION_DOMAIN].cloudfront.net",
...
```

## Deploy

```sh
$ aws s3 sync build s3://[BUCKET_NAME] --cache-control "no-store, no-cache"
```

* Visit `https://[DISTRIBUTION_DOMAIN].cloudfront.net`
