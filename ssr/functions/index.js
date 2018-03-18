"use strict";

const functions = require("firebase-functions");
const next = require("next");

const app = next({ conf: { distDir: "next" } });
const handle = app.getRequestHandler();

exports.index = functions.https.onRequest((request, response) =>
  app.prepare().then(() => handle(request, response))
);
