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

## Configure Infrastructure

* Create a S3 Bucket

```sh
$ BUCKET_NAME=[your bucket name]
$ aws s3api create-bucket --bucket $BUCKET_NAME
```

* Create an IAM Role for Lambda

```sh
$ ROLE_NAME=[your role name]
$ cat > trustpolicy.json << EOF
{
  "Statement": {
    "Effect": "Allow",
    "Action": "sts:AssumeRole",
    "Principal": { "Service": "lambda.amazonaws.com" }
  }
}
EOF
$ aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://trustpolicy.json
$ aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
$ ROLE_ARN=`aws iam get-role --role-name $ROLE_NAME --query Role.Arn --output text`
```

* Create a Lambda function

```sh
$ FUNCTION_NAME=[your function name]
$ cat > index.js << EOF
exports.handler = (event, context, callback) =>
  callback(null, "Hello from Lambda");
EOF
$ zip index.zip index.js
$ aws s3 cp index.zip s3://$BUCKET_NAME/index.zip
$ aws lambda create-function --function-name $FUNCTION_NAME --runtime nodejs6.10 --role $ROLE_ARN --handler index.handler --code S3Bucket=$BUCKET_NAME,S3Key=index.zip
$ FUNCTION_ARN=`aws lambda get-function --function-name $FUNCTION_NAME --query Configuration.FunctionArn --output text`
```

* Create an API as a web site endpoint  
  Doc: https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html

```sh
$ API_NAME=[your api name]
$ aws apigateway create-rest-api --name $API_NAME
...
    "id": "xxxxxxxxxx",
...
$ API_ID=xxxxxxxxxx
$ ROOT_RESOURCE_ID=`aws apigateway get-resources --rest-api-id $API_ID --query items[0].id --output text`
```

* Add a proxy resource to root resource

```sh
$ aws apigateway create-resource --rest-api-id $API_ID --parent-id $ROOT_RESOURCE_ID --path-part {proxy+}
...
    "id": "xxxxxx",
...
$ PROXY_RESOURCE_ID=xxxxxx
```

* Add ANY method to the resources

```sh
$ aws apigateway put-method --rest-api-id $API_ID --resource-id $ROOT_RESOURCE_ID --http-method ANY --authorization-type NONE
$ aws apigateway put-integration --rest-api-id $API_ID --resource-id $ROOT_RESOURCE_ID --http-method ANY --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$FUNCTION_ARN/invocations"
$ aws apigateway put-method --rest-api-id $API_ID --resource-id $PROXY_RESOURCE_ID --http-method ANY --authorization-type NONE
$ aws apigateway put-integration --rest-api-id $API_ID --resource-id $PROXY_RESOURCE_ID --http-method ANY --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$FUNCTION_ARN/invocations"
```

* Deploy the API

```sh
$ aws apigateway create-deployment --rest-api-id $API_ID --stage-name default
```

* Add permission to the Lambda function

```sh
$ ACCOUNT_ID=`aws sts get-caller-identity --query Account --output text`
$ aws lambda add-permission --function-name $FUNCTION_NAME --statement-id $FUNCTION_NAME --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn arn:aws:execute-api:us-east-1:$ACCOUNT_ID:$API_ID/*
```

* Create CloudFront Distribution

```sh
$ cat > distribution.json << EOF
{
  "Comment": "",
  "Origins": {
    "Items": [
      {
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only",
          "OriginSslProtocols": {
            "Items": ["TLSv1", "TLSv1.1", "TLSv1.2"],
            "Quantity": 3
          }
        },
        "Id": "origin",
        "DomainName": "$API_ID.execute-api.us-east-1.amazonaws.com",
        "OriginPath": "/default"
      }
    ],
    "Quantity": 1
  },
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
      "QueryString": true
    },
    "MinTTL": 0,
    "MaxTTL": 0,
    "DefaultTTL": 0,
    "Compress": true
  },
  "CallerReference": "distribution-$API_NAME"
}
EOF
$ aws cloudfront create-distribution --distribution-config file://distribution.json
...
        "DomainName": "xxxxxxxxxxxxxx.cloudfront.net",
...
$ DOMAIN_NAME=xxxxxxxxxxxxxx.cloudfront.net
```

## Create a function for Next.js app

`aws/index.js`

```js
"use strict";

const awsServerlessExpress = require("aws-serverless-express");
const express = require("express");
const next = require("next");

const app = next({ conf: { distDir: "next" } });
const handle = app.getRequestHandler();

const requestListener = express();
requestListener.get("*", (req, res) => {
  console.log(req.originalUrl);
  return handle(req, res);
});

exports.handler = (event, context) =>
  awsServerlessExpress.proxy(
    awsServerlessExpress.createServer(requestListener),
    event,
    context
  );
```

## Set dependencies for the function

`aws/package.json`

```json
{
  "dependencies": {
    "aws-serverless-express": "^3.1.3",
    "express": "^4.16.3",
    "next": "^5.0.1-canary.16",
    "react": "^16.2.0",
    "react-dom": "^16.2.0"
  }
}
```

## Deploy

```sh
$ cp -r next aws
$ cd aws
$ npm install
$ zip -r index.zip *
$ aws s3 cp index.zip s3://$BUCKET_NAME/index.zip
$ aws lambda update-function-code --function-name $FUNCTION_NAME --s3-bucket $BUCKET_NAME --s3-key index.zip
```

* Visit `https://xxxxxxxxxxxxxx.cloudfront.net`

```sh
open https://$DOMAIN_NAME
```
