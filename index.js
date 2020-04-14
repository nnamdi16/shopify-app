const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const crypto = require("crypto");
const cookie = require("cookie")
// const cookie = require("cookie");
const nonce = require("nonce");
const queryString = require('request-promise');
const request = require("request");

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const scopes = 'read_products';
const forwardingAddress = "http://4ec9c252.ngrok.io";


app.get("/", (req,res)=> {
 
  res.send("Hello World");
});

app.get("/shopify",(req,res)=> {
  const shop = req.query.shop;
  if(shop) {
    const state = nonce();
    const redirectUri = `${forwardingAddress}/shopify/callback`;
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&state=${state}&redirect_uri=${redirectUri}`;
    res.cookie('state', state);
    return res.redirect(installUrl);
  }
  return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
})
app.listen(3000, () => {
  console.log(apiKey);
  console.log('App listening on port 3000!');
});