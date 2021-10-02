const http = require('http');
const express = require('express');
const { createMessageAdapter } = require('@slack/interactive-messages');
const { WebClient } = require('@slack/web-api');
const { users, neighborhoods } = require('./models');
const axios = require('axios');
const bodyParser = require('body-parser');
const slackSigningSecret = '4f5bc0a746b803da2eedc471ecd45d5c';
const slackAccessToken = 'xapp-1-A02FW72ERAR-2555021190308-379274b046dfa2265864e0c81e4897d7054fe2c6864838e2a65b7f2ac66feea6';

// Create the adapter using the app's signing secret
const slackInteractions = createMessageAdapter(slackSigningSecret);

// Create a Slack Web API client using the access token
const web = new WebClient(slackAccessToken);

// Initialize an Express application
const app = express();

// Attach the adapter to the Express application as a middleware
app.use('/slack/actions', slackInteractions.expressMiddleware());

// Attach the slash command handler
app.post('/slack/commands', bodyParser.urlencoded({ extended: false }), slackSlashCommand);

const port = 3000
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});



// Example interactive messages
const interactiveButtons = {
	"blocks": [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "Welcome to eSwag! Choose the options below"
			}
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "List Products",
						"emoji": true
					},
					"style": "primary",
					"value": "list_products"
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Review Cart",
						"emoji": true
					},
					"value": "review_cart"
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Checkout",
						"emoji": true
					},
					"value": "checkout"
				}
			]
		}
	]
};





// Slack slash command handler
function slackSlashCommand(req, res, next) {
  if (req.body.command === '/estore') {
    res.json(interactiveButtons);
  }
  else{
    next();
  }
}

// Slack interactive message handlers
slackInteractions.action('list_products', (payload, respond) => {
  console.log(`The user pressed a button`);

  respond({
    text: 'thanks for clicking randomly'
  });

  // Before the work completes, return a message object that is the same as the original but with
  // the interactive elements removed.
  const reply = payload.original_message;
  delete reply.attachments[0].actions;
  return reply;
});

//Junk below

// Slack slash command handler
function slackSlashCommand1(req, res, next) {
  if (req.body.command === '/estore') {
    const type = req.body.text.split(' ')[0];
    if (type === 'products') {
      res.json(interactiveButtons);
    } else if (type === 'cart') {
      res.json(interactiveMenu);
    } else if (type === 'checkout') {
      res.send();
      (async () => {
        try {
          // Open dialog
          const response = await web.dialog.open({ 
            trigger_id: req.body.trigger_id,
            dialog,
          });
        } catch (error) {
          axios.post(req.body.response_url, {
            text: `An error occurred while opening the dialog: ${error.message}`,
          }).catch(console.error);
        }
      })();
    } else {
      res.send('Use this command followed by `products`, `cart`, or `checkout`.');
    }
  } else {
    next();
  }
}

