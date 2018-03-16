# Use GCP

## Set-up

* Install Google Cloud SDK
  Doc: https://cloud.google.com/sdk/downloads#interactive

```sh
$ curl https://sdk.cloud.google.com | bash
$ exec -l $SHELL
```

* Initialize

```sh
$ gcloud init
```

## Configure Infrastructure

* Create a new project

```sh
$ gcloud projects create [PROJECT_ID]
```

* Switch the project

```sh
$ gcloud config set project [PROJECT_ID]
```

* Create App Engine

```sh
$ gcloud app create
```

* Create app.yaml for static website
  Doc: https://cloud.google.com/appengine/docs/standard/php/getting-started/hosting-a-static-website

```sh
$ cat > app.yaml << EOF
runtime: php55

handlers:
  -
    url: /(.*\.(js|css|jpg|png|ico|svg))$
    static_files: build/\1
    upload: build/(.*\.(js|css|jpg|png|ico|svg))$
  -
    url: /.*
    static_files: build/index.html
    upload: build/index.html

skip_files:
  - ^(?!.*build).*$
EOF
```


## Deploy

```sh
$ gcloud app deploy
...
target url:      [https://[PROJECT_ID].appspot.com]
...
```

* Visit `https://[PROJECT_ID].appspot.com`
