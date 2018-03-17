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
  * https://firebase.google.com/docs/hosting/quickstart  
  * https://firebase.google.com/docs/functions/get-started

```sh
$ firebase init
...
? Which Firebase CLI features do you want to setup for this folder? Press Space
to select features, then Enter to confirm your choices.
 ◯ Database: Deploy Firebase Realtime Database Rules
 ◯ Firestore: Deploy rules and create indexes for Firestore
❯◉ Functions: Configure and deploy Cloud Functions
 ◉ Hosting: Configure and deploy Firebase Hosting sites
 ◯ Storage: Deploy Cloud Storage security rules
...
? Select a default Firebase project for this directory:
  [don't setup a default project]
❯ [create a new project]
...
? What language would you like to use to write Cloud Functions? JavaScript
? Do you want to use ESLint to catch probable bugs and enforce style? No
✔  Wrote functions/package.json
✔  Wrote functions/index.js
? Do you want to install dependencies with npm now? No
...
? What do you want to use as your public directory? public
? Configure as a single-page app (rewrite all urls to /index.html)? No
...
```

* Visit https://console.firebase.google.com
* Create a new project
* Associate the project

```sh
$ firebase use --add
```

## Create a function for Next.js app

`functions/index.js`

```js
"use strict";

const functions = require("firebase-functions");
const next = require("next");

const app = next({ conf: { distDir: ".next" } });
const handle = app.getRequestHandler();

exports.index = functions.https.onRequest((request, response) =>
  app.prepare().then(() => handle(request, response))
);
```

## Set dependencies for the function

`functions/package.json`

```json
{
  "dependencies": {
    "firebase-admin": "~5.10.0",
    "firebase-functions": "^0.8.2",
    "next": "^5.0.1-canary.16",
    "react": "^16.2.0",
    "react-dom": "^16.2.0"
  }
}
```

## Configure firebase.json

`firebase.json`

```json
{
  "functions": {
    "predeploy": ["npm install"]
  },
  "hosting": {
    "public": "static",
    "rewrites": [
      {
        "source": "**",
        "function": "index"
      }
    ]
  }
}
```

## Deploy

```sh
$ cp -r .next functions
$ firebase deploy
...
Hosting URL: https://[PROJECT_NAME].firebaseapp.com
```

* Visit `https://[PROJECT_NAME].firebaseapp.com`