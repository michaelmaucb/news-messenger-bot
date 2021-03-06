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
          if (event.message) {
            console.log("sending messages :)")
            handleMessage(event.sender.id, event.message);
          } else {
            console.log(event)
            if(event.postback && event.postback.payload === "GET_STARTED") {
              //present user with some greeting or call to action
              // var msg = "Hello! Welcome to the News-Flash-Bot!\n Type the command 'News' to get started."
              //
              // let response;
              // response = {
              //   "text": msg
              // }
              let response;
              response = {
                "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": [
                      {
                        "title": "Welcome to the News-Flash-Bot!\n How often would you like to receive digests?",
                        "buttons": [
                          {
                            "type": "postback",
                            "title" : "Daily",
                            "payload" : "Daily"
                          },
                          {
                            "type": "postback",
                            "title" : "Weekly",
                            "payload" : "Weekly"
                          }
                        ]
                      }
                    ]
                  }
                }
              }

              console.log(event.sender.id);
              callSendAPI(event.sender.id, response);

            } else if (event.postback) {
              handlePostback(event.sender.id, event.postback);
            }
          }
        });
      } else {
        // TODO: is this else case necessary?
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


app.get('/setup',function(req,res){
    setupGetStartedButton(res);
});


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
  let newsTopics = ["Latest News", "U.S.", "International", "Politics", "Business", "Technology"]
  // Checks if the message contains text
  console.log("goes through handle message")

  //handle news functionality
  console.log("_________________________________")

  console.log("REICEIVED MESSAGE:" + received_message)
  console.log("_________________________________")

  if (received_message.text == 'news' || received_message.text == 'News') {
    console.log("goes through news")

    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [
            {
              "title": "Swipe left/right for more options.",
              "buttons": [
                {
                  "type": "postback",
                  "title": newsTopics[0],
                  "payload": newsTopics[0]
                },
                {
                  "type": "postback",
                  "title": newsTopics[1],
                  "payload": newsTopics[1]
                },
                {
                  "type": "postback",
                  "title": newsTopics[2],
                  "payload": newsTopics[2]
                }
              ]
            },
            {
              "title": "Swipe left/right for more options.",
              "buttons": [
                {
                  "type": "postback",
                  "title": newsTopics[3],
                  "payload": newsTopics[3]
                },
                {
                  "type": "postback",
                  "title": newsTopics[4],
                  "payload": newsTopics[4]
                },
                {
                  "type": "postback",
                  "title": newsTopics[5],
                  "payload": newsTopics[5]
                }
              ]
            }
          ]
        }
      }
    }


  } else if (received_message.text == "Gun Control") {
    console.log("Gun control payload entered");

    response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"generic",
          "elements":[
            {
              "title":"New study finds that 'waiting periods' for gun ownership could save a lot of lives",
              "image_url":"https://images.dailykos.com/images/461804/story_image/GettyImages-634592362.jpg?1508265079",
              "subtitle":"A new study by a few Harvard professors found that requiring a waiting period for someone to own a gun could reduce firearm homicides by 17 percent.",
              "default_action": {
                "type":"web_url",
                "url": "https://www.dailykos.com/stories/2017/10/17/1707563/-New-study-finds-that-waiting-periods-for-gun-ownership-could-save-a-lot-of-lives"
              }
            }
          ]
        }
      }
    }
    console.log("Gun control payload entered");
  } else if (received_message.attachments) {
    // Gets the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;

  } else if (received_message.text == "9:30 AM") {
    console.log("ENTERED THE TIME ZONE")
    response = {
      "text": "Perfect! News Flash Bot will message you every day at 9:30 AM. To continue browsing news today, simply type the command 'News'."
    }
  }

  // Sends the response message
  callSendAPI(sender_psid, response);
}


function handlePostback(sender_psid, received_postback) {
  let response;
  let newsTopics = ["Latest News", "U.S.", "International", "Politics", "Business", "Technology"]


  // Get the payload for the postback
  let payload = received_postback.payload;
  console.log(payload);
  console.log("___________________________")

  // Set the response based on the postback payload

  // 0 ==> Latest News
  if (payload == newsTopics[0]) {
    response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"generic",
          "elements":[
            {
              "title":"U.S.: Black Friday boosts battered department stores, some of which are claiming a 'record' weekend",
              "image_url":"https://fm.cnbc.com/applications/cnbc.com/resources/img/editorial/2014/11/12/102178715-452436613.530x298.jpg?v=1476720910",
              "subtitle":"Department stores overall appear to have fared well on Black Friday, kicking off the holiday shopping season on a high note.",
              "default_action": {
                "type":"web_url",
                "url": "https://www.cnbc.com/2017/11/25/black-friday-boosts-battered-department-stores-on-thanksgiving-weekend.html"
              }
            },

             {
              "title":"International: Egypt attack: Gunmen kill 235 in Sinai mosque",
              "image_url":"https://ichef.bbci.co.uk/news/695/cpsprodpb/B1ED/production/_98894554_mediaitem98894553.jpg",
              "subtitle":"Militants have launched a bomb and gun attack on a mosque in Egypt's North Sinai province, killing 235 people, state media say.",
              "default_action": {
                "type":"web_url",
                "url": "http://www.bbc.com/news/world-middle-east-42110223"
              }
            },

            {
              "title":"Politics: Flynn's lawyers no longer sharing information with Trump's legal team",
              "image_url":"http://cdn.cnn.com/cnnnext/dam/assets/161117201720-02-michael-flynn-1117-exlarge-169.jpg",
              "subtitle":"Michael Flynn's lawyers have told other defense lawyers in the ongoing Russia probe, including President Donald Trump's legal team, that they're no longer able to share information.",
              "default_action": {
                "type":"web_url",
                "url": "http://www.cnn.com/2017/11/23/politics/michael-flynn-donald-trump-robert-mueller-new-york-times/index.html"
              }
            },

            {
              "title":"Business: Justice Department Sues to Block AT&T-Time Warner Merger",
              "image_url":"https://static01.nyt.com/images/2017/11/16/business/16ATT1/merlin_126367256_9dae289a-25bb-4515-b492-6d88e020d906-master768.jpg",
              "subtitle":"The deal for Time Warner is designed to help AT&T counter slowing growth in its core wireless, internet and satellite businesses while fending off online video upstarts like Netflix and Hulu.",
              "default_action": {
                "type":"web_url",
                "url": "https://www.nytimes.com/2017/11/20/business/dealbook/att-time-warner-merger.html"
              }
            },
            {
              "title":"Technology: FCC chief plans to ditch U.S. 'net neutrality' rules",
              "image_url":"https://media.npr.org/assets/img/2017/11/22/gettyimages-698650254-86556145b9021dd4439c4e7db5f7397281deec52-s1200.jpg",
              "subtitle":"The head of the U.S. Federal Communications Commission unveiled plans on Tuesday to repeal landmark 2015 rules that prohibited internet service providers from impeding consumer access to web content in a move that promises to recast the digital landscape.",
              "default_action": {
                "type":"web_url",
                "url": "https://www.reuters.com/article/us-usa-internet-exclusive/fcc-chief-plans-to-ditch-u-s-net-neutrality-rules-idUSKBN1DL21A"
              }
            }
          ]
        }
      }
    }
    console.log("Gun control payload entered");
  } else if (payload == newsTopics[3]) {

    response = {
      "attachment":{
        "type":"template",

        "payload":{
          "template_type":"generic",
          "elements":[
            {


              "title": "Trump to discuss tax plan with Senate Republicans next week: senator",
              "image_url":"https://s3.reutersmedia.net/resources/r/?m=02&d=20171124&t=2&i=1211110331&r=LYNXMPEDAN14Q&w=1280",
              "subtitle":"U.S. Senator John Barrasso said in a statement that Trump will meet with Republican senators at their weekly luncheon at the U.S. Capitol on Tuesday.",
              "default_action": {
                "type":"web_url",
                "url": "https://www.reuters.com/article/us-usa-tax/trump-to-discuss-tax-plan-with-senate-republicans-next-week-senator-idUSKBN1DO1X6"
              },
              "buttons":[
                {
                  "type":"postback",
                  "title":"View the Sides",
                  "payload":"POLITICS_TAX_PAYLOAD"
                }

              ]
            }

          ]
        }

      }
    }




  } else if (payload == "Daily") {
      // handle subscription postback
      response = {
        "text": "What time would you like to receive messages? Type your response in the format '--:-- AM/PM'."
      }
  } else if (payload == "POLITICS_TAX_PAYLOAD") {


    response = {
      "attachment": {
        "type": "template",

        "payload": {
          "template_type": "list",
          "top_element_style": "compact",


          "elements": [
            {
                "title":"Despite skeptical public, GOP pushing ahead on tax-cut plan",
                "image_url":"https://img.washingtonpost.com/rf/image_1484w/2010-2019/Wires/Videos/201711/Reuters/Images/t_1510873085563_name_ryan.jpg?uuid=5v3cBMshEee1BooQ7RHs9Q",
                "subtitle":"Moderate Left",
                "default_action": {
                  "type":"web_url",
                  "url": "https://www.washingtonpost.com/powerpost/despite-skeptical-public-gop-pushing-ahead-on-tax-cut-plan/2017/11/25/d81ddd7c-d145-11e7-81bc-c55a220c8cbe_story.html?utm_term=.72bacd043fee"

              }

            },

            {
              "title": "Trump to visit GOP Senate in push to deliver tax 'Christmas present' to Americans",
              "image_url": "http://www.mootmagazine.com/wp-content/uploads/2017/04/trumptax.jpg",
              "subtitle": "Far Right",
              "default_action": {
                "type": "web_url",
                "url": "http://www.foxnews.com/politics/2017/11/25/trump-to-visit-gop-senate-in-push-to-deliver-tax-christmas-present-to-americans.html"

              }

            }


          ]

        }
      }
    }
  }

  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}
