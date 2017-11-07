'use strict';

// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      // console.log(entry)
      // console.log(webhook_event.sender)

      if (webhook_event.message) {
        console.log(webhook_event)
        if (webhook_event.message == 'TEST_MESSAGE') {
          return
        }
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);

        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }

    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/webhook/', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "news"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}



function handleMessage(sender_psid, received_message) {

  let response;
  let newsTopics = ["Health Care", "Gun Control", "White House", "Congress"];

  // Checks if the message contains text
  if (received_message.text) {
    
    // Creates the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
    }

    //handle news functionality
    if (received_message.text == 'news') {
       response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": newsTopics[0],
                "payload": newsTopics[0],
              },
              {
                "type": "postback",
                "title": newsTopics[1],
                "payload": newsTopics[1],
              },
              {
                "type": "postback",
                "title":  newsTopics[2],
                "payload":  newsTopics[2],
              },
              {
                "type": "postback",
                "title": newsTopics[3],
                "payload": newsTopics[3],
              }

            ],
          }]
        }
      }

    }

  } else if (received_message.attachments) {
  
    // Gets the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
  
  } 
  
  // Sends the response message
  callSendAPI(sender_psid, response);    
}


function handlePostback(sender_psid, received_postback) {
  let response;
  let newsTopics = ["Health Care", "Gun Control", "White House", "Congress"];

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === newsTopics[0]) {
    response = { "text": "Let's talk about health care!" }
  } else if (payload === newsTopics[1]) {
    response = { "text": "Let's talk about gun control! Here's your news briefing." }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}














// 'use strict';

// // Imports dependencies and set up http server
// const
//   request = require('request'),
//   express = require('express'),
//   bodyParser = require('body-parser'),
//   app = express().use(bodyParser.json()); // creates express http server

// const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// // Sets server port and logs message on success
// app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// // Creates the endpoint for our webhook 
// app.post('/webhook', (req, res) => {  
 
//   let body = req.body;

//   // Checks this is an event from a page subscription
//   if (body.object === 'page') {

//     // Iterates over each entry - there may be multiple if batched
//     body.entry.forEach(function(entry) {

//       // Gets the body of the webhook event
//       let webhook_event = entry.messaging[0];
//       console.log(webhook_event);

//       // Get the sender PSID
//       // console.log(entry)
//       // console.log(webhook_event.sender)

//       if (webhook_event.message) {
//         console.log(webhook_event)
//         if (webhook_event.message == 'TEST_MESSAGE') {
//           return
//         }
//         let sender_psid = webhook_event.sender.id;
//         console.log('Sender PSID: ' + sender_psid);

//         handleMessage(sender_psid, webhook_event.message);        
//       } else if (webhook_event.postback) {
//         console.log("daivd choi lakdsfjlkajfksj")
//         handlePostback(sender_psid, webhook_event.postback);
//       }

//     });

//     // Returns a '200 OK' response to all requests
//     res.status(200).send('EVENT_RECEIVED');
//   } else {
//     // Returns a '404 Not Found' if event is not from a page subscription
//     res.sendStatus(404);
//   }

// });

// // Adds support for GET requests to our webhook
// app.get('/webhook/', (req, res) => {

//   // Your verify token. Should be a random string.
//   let VERIFY_TOKEN = "news"
    
//   // Parse the query params
//   let mode = req.query['hub.mode'];
//   let token = req.query['hub.verify_token'];
//   let challenge = req.query['hub.challenge'];
    
//   // Checks if a token and mode is in the query string of the request
//   if (mode && token) {
  
//     // Checks the mode and token sent is correct
//     if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
//       // Responds with the challenge token from the request
//       console.log('WEBHOOK_VERIFIED');
//       res.status(200).send(challenge);
    
//     } else {
//       // Responds with '403 Forbidden' if verify tokens do not match
//       res.sendStatus(403);      
//     }
//   }
// });


// app.get('/setup',function(req,res){

//     setupGetStartedButton(res);
// });

// function callSendAPI(sender_psid, response) {
//   // Construct the message body
//   let request_body = {
//     "recipient": {
//       "id": sender_psid
//     },
//     "message": response
//   }

//   // Send the HTTP request to the Messenger Platform
//   request({
//     "uri": "https://graph.facebook.com/v2.6/me/messages",
//     "qs": { "access_token": PAGE_ACCESS_TOKEN },
//     "method": "POST",
//     "json": request_body
//   }, (err, res, body) => {
//     if (!err) {
//       console.log('message sent!')
//     } else {
//       console.error("Unable to send message:" + err);
//     }
//   }); 
// }



// function handleMessage(sender_psid, received_message) {

//   let response;

//   // Checks if the message contains text
//   if (received_message.text) {
    
//     // Creates the payload for a basic text message, which
//     // will be added to the body of our request to the Send API
//     response = {
//       "templace_type" : "button", 
//       "text": "start"

//       // "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
//     }

//   } else if (received_message.attachments) {
  
//     // Gets the URL of the message attachment
//     let attachment_url = received_message.attachments[0].payload.url;
  
//   } 
  
//   // Sends the response message
//   callSendAPI(sender_psid, response);    
// }


// function handlePostback(sender_psid, received_postback) {
//   let response;
  
//   // Get the payload for the postback
//   let payload = received_postback.payload;

//   // Set the response based on the postback payload
//   if (payload === 'yes') {
//     response = { "text": "Thanks!" }
//   } else if (payload === 'no') {
//     response = { "text": "Oops, try sending another image." }
//   }
//   // Send the message to acknowledge the postback
//   callSendAPI(sender_psid, response);
// }








