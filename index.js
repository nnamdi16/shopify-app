const dotenv = require("dotenv");
const express = require("express");
const app = express();
const crypto = require("crypto");
const cookie = require("cookie");
const nonce = require("nonce");
const queryString = require('request-promise');
const request = require("request");

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const scopes = 'read_products';
const forwardingAddress = "https://f0403c54.ngrok.io";


app.get("/", (req,res)=> {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});