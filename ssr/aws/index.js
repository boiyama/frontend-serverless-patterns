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
