'user-strict'

const express = require('express');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const router = express.Router();

//middleware
require('dotenv').config();

// configure aws
AWS.config.update({
  "region": 'us-east-1',
  "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
  "accessKeyId": process.env.ACCESSKEYID,
  "secretAccessKey": process.env.SECRETKEYID
});

// instantiate the aws dynamodb client
const docClient = new AWS.DynamoDB.DocumentClient();

// POST /auth/login route - returns a JWT
router.post('/login', (req, res) => {
  console.log('In the POST /auth/login route');
  console.log(req.body);

  // manually querying for a specific known user.
  var params = {
    TableName: "plantUser",
    Key: {
      "id": "123123"
    }
  };

  // using a .get call rather than .query since there's only one user
  docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        console.log(data.Item);
        const token = jwt.sign(data.Item.password, process.env.JWT_SECRET, {
          expiresIn: 60 * 60 * 24 // 24 hours in seconds
        })
        res.send({ token: token});
    }
  });

});

// as of now, the data being returned will be the user since we don't have watering history data yet.
router.get('/data', (req, res)=> {

  var params = {
      TableName : "plantUser",
      IndexName : "lastname-index", 
      KeyConditionExpression: "lastname = :lastname",
      ExpressionAttributeValues: {
          ":lastname": "chidrome"
      }
  };

  docClient.query(params, function(err, data) {
    
      if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
          console.log("Query succeeded.");
          console.log(data);
          data.Items.forEach(function(item) {
              console.log("my first name is", item.firstname + " and my last name is " + item.lastname);
          });
          res.send(data.Items);
      }
  });
  
});

module.exports = router;
