# Use Firebase

## Set-up

* Install Node.js
* Install Firebase CLI

```sh
$ npm install -g firebase-tools
```

* Log-in Firebase

```sh
$ firebase login
```

## Configure Infrastructure

* Create Firebase configuration file  
  Doc: https://firebase.google.com/docs/hosting/quickstart

```sh
$ firebase init
...
? Which Firebase CLI features do you want to setup for this folder? Press Space
to select features, then Enter to confirm your choices.
 ◯ Database: Deploy Firebase Realtime Database Rules
 ◯ Firestore: Deploy rules and create indexes for Firestore
 ◯ Functions: Configure and deploy Cloud Functions
❯◉ Hosting: Configure and deploy Firebase Hosting sites
 ◯ Storage: Deploy Cloud Storage security rules
...
? Select a default Firebase project for this directory:
  [don't setup a default project]
❯ [create a new project]
...
? What do you want to use as your public directory? build
? Configure as a single-page app (rewrite all urls to /index.html)? Yes
? File dist/index.html already exists. Overwrite? No
...
```

* Visit https://console.firebase.google.com
* Create a new project
* Associate the project

```sh
$ firebase use --add
```

## Deploy

```sh
$ firebase deploy
...
Hosting URL: https://[PROJECT_NAME].firebaseapp.com
```

* Visit `https://[PROJECT_NAME].firebaseapp.com`