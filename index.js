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

      if (entry.messaging) {
        entry.messaging.forEach(function(event) {
          // console.log("jay is cool")
          if (event.message) {
            console.log("sending messages :)")
            handleMessage(event.sender.id, event.message);
          } else {
            console.log(event)
            if(event.postback && event.postback.payload === "GET_STARTED")
            {
                    //present user with some greeting or call to action
                    var msg = "Hello! Welcome to the News-Flash-Bot!!"
                    // console.log(msg)
                    let response;
                    response = {
                      "text": msg
                    }
                    callSendAPI(event.sender.id, response);

                    let newResponse;
                    newResponse = {
                    
                        "text" : "Press news!",
                        "quick_replies":[
                          {
                            "content_type":"text",
                            "title":"News",
                            "payload":"news"
                          }
                        ]
                    }
                      console.log("new response")

                    callSendAPI(event.sender.id, newResponse);
                    console.log("new response")

      
            } 
          }
        });
      } else {
        // console.log(entry)
        // console.log("david choi")
        // var msg = "Hi ,I'm a Bot ,and I was created to help you easily .... "
        // handleMessage(entry.id, msg)

      }

      // // Gets the body of the webhook event
      // console.log(entry)
      // console.log("____________________")
      // console.log(entry.messaging)
      // console.log("____________________")
      // console.log(entry.messaging[0])

      // let webhook_event = entry.messaging[0];
      // console.log(webhook_event);

      // // Get the sender PSID
      // // console.log(entry)
      // // console.log(webhook_event.sender)

      // if (webhook_event.message) {
      //   console.log(webhook_event)
      //   if (webhook_event.message == 'TEST_MESSAGE') {
      //     return
      //   }
      //   let sender_psid = webhook_event.sender.id;
      //   console.log('Sender PSID: ' + sender_psid);

      //   handleMessage(sender_psid, webhook_event.message);        
      // } else if (webhook_event.postback) {
      //   handlePostback(sender_psid, webhook_event.postback);
      // } else {
      //   if(event.postback && event.postback.payload === USER_DEFINED_PAYLOAD ){
      //           //present user with some greeting or call to action
      //     var msg = "Hi, I'm a News-Flash-Bot"
      //     // handleMessage(sender_psid,msg);
      //   } 
      // }

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

app.get('/setup',function(req,res){
    setupGetStartedButton(res);
    // setupPersistentMenu(res);
    // setupGreetingText(res);
});

// function setupGreetingText(res){
//   var messageData = {
//       "greeting":[
//           {
//           "locale":"default",
//           "text":"Welcome to the News Flash Bot!"
//           }, {
//           "locale":"en_US",
//           "text":"Welcome to the News Flash Bot!"
//           }
//       ]};
//   request({
//       url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ PAGE_ACCESS_TOKEN,
//       method: 'POST',
//       headers: {'Content-Type': 'application/json'},
//       form: messageData
//   },
//   function (error, response, body) {
//       if (!error && response.statusCode == 200) {
//           // Print out the response body
//           console.log("Success")
//           res.send(body);

//       } else { 
//           // TODO: Handle errors
//           console.log("Fail")

//           res.send(body);
//           // console.log("Fail")

//       }
//   });

// }

// function setupPersistentMenu(res){
//   var messageData = 
//       {"persistent_menu":[
//           {
//           "locale":"default",
//           "composer_input_disabled":true,
//           "call_to_actions":[
//               {
//               "title":"Info",
//               "type":"nested",
//               "call_to_actions":[
//                   {
//                   "title":"Help",
//                   "type":"postback",
//                   "payload":"HELP_PAYLOAD"
//                   },
//                   {
//                   "title":"Contact Me",
//                   "type":"postback",
//                   "payload":"CONTACT_INFO_PAYLOAD"
//                   }
//               ]
//               },
//               {
//               "type":"web_url",
//               "title":"Visit website ",
//               "url":"http://www.facebook.com",
//               "webview_height_ratio":"full"
//               }
//           ]
//           },
//           {
//           "locale":"zh_CN",
//           "composer_input_disabled":false
//           }
//       ]};  
//   // Start the request
//   request({
//       url: "https://graph.facebook.com/v2.6/me/messenger_profile?access_token="+ PAGE_ACCESS_TOKEN,
//       method: 'POST',
//       headers: {'Content-Type': 'application/json'},
//       form: messageData
//   },
//   function (error, response, body) {
//       if (!error && response.statusCode == 200) {
//           // Print out the response body
//           res.send(body);

//       } else { 
//           // TODO: Handle errors
//           res.send(body);
//       }
//   });

// }

function setupGetStartedButton(res){
  var messageData = {
    "get_started":{
          "payload":"GET_STARTED"
    }
  };
  // Start the request
  request({
      url: "https://graph.facebook.com/v2.6/me/messenger_profile?access_token="+ PAGE_ACCESS_TOKEN,
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      form: messageData
  },
  function (error, response, body) {
      if (!error && response.statusCode == 200) {
          // Print out the response body
          res.send(body);

      } else { 
          // TODO: Handle errors
          res.send(body);
      }
  });
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  console.log(response);
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
  let newsTopics = ["Gun Control", "White House", "Health Care"];
  // Checks if the message contains text
      console.log("goes through handle message")

     //handle news functionality
    if (received_message.text == 'news') {
      console.log("goes through news")

      response = {
        "attachment" : {
          "type" : "template",
          "payload" : {
              "template_type":"button",
              "text":"To get started, choose a news topic you'd like to explore.",
              "buttons":[
                {
                  "type" : "postback",
                  "title" : newsTopics[0],
                  "payload" : newsTopics[0]
                },
                {
                  "type" : "postback",
                  "title" : newsTopics[1],
                  "payload" : newsTopics[1]
                },
                {
                  "type" : "postback",
                  "title" : newsTopics[2],
                  "payload" : newsTopics[2]
                }
              ]
          }

        }

      }


    //    response = {
    //   "attachment": {
    //     "type": "template",
    //     "payload": {
    //       "template_type": "generic",
    //       "elements": [{
    //         "title": "Which news topic would you like to explore?",
    //         "subtitle": "Tap a news topic to get started.",
    //         // "image_url": attachment_url,
    //         "buttons": [
    //           {
    //             "type": "postback",
    //             "title": newsTopics[0],
    //             "payload": newsTopics[0],
    //           },
    //           {
    //             "type": "postback",
    //             "title": newsTopics[1],
    //             "payload": newsTopics[1],
    //           },
    //           {
    //             "type": "postback",
    //             "title":  newsTopics[2],
    //             "payload":  newsTopics[2],
    //           },
    //           {
    //             "type": "postback",
    //             "title": newsTopics[3],
    //             "payload": newsTopics[3],
    //           }

    //         ],
    //       }]
    //     }
    //   }

    // }


  } else if (received_message.attachments) {
  
    // Gets the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
  
  } 
  
  // Sends the response message
  callSendAPI(sender_psid, response);    
}


function handlePostback(sender_psid, received_postback) {
  let response;
  let newsTopics = ["Gun Control", "White House", "Health Care"];

  
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
    // Set the response based on the postback payload
  if (payload === newsTopics[0]) {
    response = {



    }
    console.log("Gun control payload entered");
  }




  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}