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

// Slack interactive message handlers
slackInteractions.action('accept_tos', (payload, respond) => {
  console.log(`The user ${payload.user.name} in team ${payload.team.domain} pressed a button`);

  // Use the data model to persist the action
  users.findBySlackId(payload.user.id)
    .then(user => user.setPolicyAgreementAndSave(payload.actions[0].value === 'accept'))
    .then((user) => {
      // After the asynchronous work is done, call `respond()` with a message object to update the
      // message.
      let confirmation;
      if (user.agreedToPolicy) {
        confirmation = 'Thank you for agreeing to the terms of service';
      } else {
        confirmation = 'You have denied the terms of service. You will no longer have access to this app.';
      }
      respond({ text: confirmation });
    })
    .catch((error) => {
      // Handle errors
      console.error(error);
      respond({
        text: 'An error occurred while recording your agreement choice.'
      });
    });

  // Before the work completes, return a message object that is the same as the original but with
  // the interactive elements removed.
  const reply = payload.original_message;
  delete reply.attachments[0].actions;
  return reply;
});

slackInteractions
  .options({ callbackId: 'pick_sf_neighborhood', within: 'interactive_message' }, (payload) => {
    console.log(`The user ${payload.user.name} in team ${payload.team.domain} has requested options`);

    // Gather possible completions using the user's input
    return neighborhoods.fuzzyFind(payload.value)
      // Format the data as a list of options
      .then(formatNeighborhoodsAsOptions)
      .catch((error) => {
        console.error(error);
        return { options: [] };
      });
  })
  .action('pick_sf_neighborhood', (payload, respond) => {
    console.log(`The user ${payload.user.name} in team ${payload.team.domain} selected from a menu`);

    // Use the data model to persist the action
    neighborhoods.find(payload.actions[0].selected_options[0].value)
      // After the asynchronous work is done, call `respond()` with a message object to update the
      // message.
      .then((neighborhood) => {
        respond({
          text: payload.original_message.text,
          attachments: [{
            title: neighborhood.name,
            title_link: neighborhood.link,
            text: 'One of the most interesting neighborhoods in the city.',
          }],
        });
      })
      .catch((error) => {
        // Handle errors
        console.error(error);
        respond({
          text: 'An error occurred while finding the neighborhood.'
        });
      });

    // Before the work completes, return a message object that is the same as the original but with
    // the interactive elements removed.
    const reply = payload.original_message;
    delete reply.attachments[0].actions;
    return reply;
  });

slackInteractions.action({ type: 'dialog_submission' }, (payload, respond) => {
  // `payload` is an object that describes the interaction
  console.log(`The user ${payload.user.name} in team ${payload.team.domain} submitted a dialog`);

  // Check the values in `payload.submission` and report any possible errors
  const errors = validateKudosSubmission(payload.submission);
  if (errors) {
    return errors;
  } else {
    setTimeout(() => {
      const partialMessage = `<@${payload.user.id}> just gave kudos to <@${payload.submission.user}>.`;

      // When there are no errors, after this function returns, send an acknowledgement to the user
      respond({
        text: partialMessage,
      });

      // The app does some work using information in the submission
      users.findBySlackId(payload.submission.id)
        .then(user => user.incrementKudosAndSave(payload.submission.comment))
        .then((user) => {
          // After the asynchronous work is done, call `respond()` with a message object to update
          // the message.
          respond({
            text: `${partialMessage} That makes a total of ${user.kudosCount}! :balloon:`,
            replace_original: true,
          });
        })
        .catch((error) => {
          // Handle errors
          console.error(error);
          respond({ text: 'An error occurred while incrementing kudos.' });
        });
    });
  }
});


// Example interactive messages
const interactiveButtons = {
	"blocks": [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "This is a header block",
				"emoji": true
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Available products"
			},
			"accessory": {
				"type": "overflow",
				"options": [
					{
						"text": {
							"type": "plain_text",
							"emoji": true,
							"text": "Option One"
						},
						"value": "value-0"
					},
					{
						"text": {
							"type": "plain_text",
							"emoji": true,
							"text": "Option Two"
						},
						"value": "value-1"
					},
					{
						"text": {
							"type": "plain_text",
							"emoji": true,
							"text": "Option Three"
						},
						"value": "value-2"
					},
					{
						"text": {
							"type": "plain_text",
							"emoji": true,
							"text": "Option Four"
						},
						"value": "value-3"
					}
				]
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*<fakeLink.toHotelPage.com|Windsor Court Hotel>*\n★★★★★\n$340 per night\nRated: 9.4 - Excellent"
			},
			"accessory": {
				"type": "image",
				"image_url": "https://api.slack.com/img/blocks/bkb_template_images/tripAgent_1.png",
				"alt_text": "Windsor Court Hotel thumbnail"
			}
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "image",
					"image_url": "https://api.slack.com/img/blocks/bkb_template_images/tripAgentLocationMarker.png",
					"alt_text": "Location Pin Icon"
				},
				{
					"type": "plain_text",
					"emoji": true,
					"text": "Location: Central Business District"
				}
			]
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*<fakeLink.toHotelPage.com|The Ritz-Carlton New Orleans>*\n★★★★★\n$340 per night\nRated: 9.1 - Excellent"
			},
			"accessory": {
				"type": "image",
				"image_url": "https://api.slack.com/img/blocks/bkb_template_images/tripAgent_2.png",
				"alt_text": "Ritz-Carlton New Orleans thumbnail"
			}
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "image",
					"image_url": "https://api.slack.com/img/blocks/bkb_template_images/tripAgentLocationMarker.png",
					"alt_text": "Location Pin Icon"
				},
				{
					"type": "plain_text",
					"emoji": true,
					"text": "Location: French Quarter"
				}
			]
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*<fakeLink.toHotelPage.com|Omni Royal Orleans Hotel>*\n★★★★★\n$419 per night\nRated: 8.8 - Excellent"
			},
			"accessory": {
				"type": "image",
				"image_url": "https://api.slack.com/img/blocks/bkb_template_images/tripAgent_3.png",
				"alt_text": "Omni Royal Orleans Hotel thumbnail"
			}
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "image",
					"image_url": "https://api.slack.com/img/blocks/bkb_template_images/tripAgentLocationMarker.png",
					"alt_text": "Location Pin Icon"
				},
				{
					"type": "plain_text",
					"emoji": true,
					"text": "Location: French Quarter"
				}
			]
		},
		{
			"type": "divider"
		}
	]
};

const interactiveMenu = {
  text: 'San Francisco is a diverse city with many different neighborhoods.',
  response_type: 'in_channel',
  attachments: [{
    text: 'Explore San Francisco',
    callback_id: 'pick_sf_neighborhood',
    actions: [{
      name: 'neighborhood',
      text: 'Choose a neighborhood',
      type: 'select',
      data_source: 'external',
    }],
  }],
};

const dialog = {
  callback_id: 'kudos_submit',
  title: 'Give kudos',
  submit_label: 'Give',
  elements: [
    {
      label: 'Teammate',
      type: 'select',
      name: 'user',
      data_source: 'users',
      placeholder: 'Teammate Name'
    },
    {
      label: 'Comment',
      type: 'text',
      name: 'comment',
      placeholder: 'Thanks for helping me with my project!',
      hint: 'Describe why you think your teammate deserves kudos.',
    },
  ],
};

// Slack slash command handler
function slackSlashCommand(req, res, next) {
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

// Helpers
function formatNeighborhoodsAsOptions(neighborhoods) {
  return {
    options: neighborhoods.map(n => ({ text: n.name, value: n.name })),
  };
}

function validateKudosSubmission(submission) {
  let errors = [];
  if (!submission.comment.trim()) {
    errors.push({
      name: 'comment',
      error: 'The comment cannot be empty',
    });
  }
  if (errors.length > 0) {
    return { errors };
  }
}