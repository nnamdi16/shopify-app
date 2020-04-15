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

app.get('/shopify/callback', (req, res) => {
  const {shop,hmac,code,state} = req.query;
  console.log(state);
  const stateCookie = cookie.parse().state;

  if (state !== stateCookie) {
    return res.status(403).send('Request origin cannot be verified');
  }

  if (shop && hmac && code) {
    const map = Object.assign({}, req.query);
    delete map['signature'];
    delete map['hmac'];
    const message = queryString.stringify(map);
    const providedHmac = Buffer.from(hmac,'utf8');
    const generatedHash = Buffer.from(
      crypto
      .createHmac('sha256',apiSecret)
      .update(message)
      .digest('hex'),
      'utf-8'
    );

    let hashEquals = false;
    try {
      hashEquals = crypto.timingSafeEqual(generatedHash,providedHmac);
    } catch (error) {
      hashEquals = false;
    }

    if (!hashEquals) {
      return res.status(400).send('HMAC validation failed')
    }
   // DONE: Exchange temporary code for a permanent access token
   const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
   const accessTokenPayload = {
     client_id:apiKey,
     client_secret:apiSecret,
     code
   }
    request.post(accessTokenRequestUrl,{
      json:accessTokenPayload
    }).then((accessTokenResponse) => {
      const accessToken = accessTokenResponse.access_token;
      // DONE: Use access token to make API call to 'shop' endpoint
      const shopRequestUrl = `https://${shop}/admin/api/2020-04/shop.json`;
      const shopRequestHeaders = {
        'X-Shopify-Access-Token':accessToken
      };
      request.get(shopRequestUrl,{headers:shopRequestHeaders})
      .then((shopResponse) => {
        res.status(200).end(shopResponse)
      })
      .catch((error) => {
        res.status(error.statusCode).send(error.error.error_description)
      })
      
    })
  }
  else{
    res.status(400).send('Required parameter missing')
  }
});
/**
 * Validating the request by using Hmac validation
 */


app.listen(3000, () => {
  console.log(apiKey);
  console.log('App listening on port 3000!');
});