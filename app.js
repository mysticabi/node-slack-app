const { App } = require('@slack/bolt');

const slackSigningSecret = '4f5bc0a746b803da2eedc471ecd45d5c';
const slackAccessToken = 'xoxb-2491257843379-2566898424480-DjxICSVDobX6wz3oCBdIGBw7';


// Initializes your app with your bot token and signing secret
const app = new App({
  token: slackAccessToken,
  signingSecret: slackSigningSecret
});

// Listens to incoming messages that contain "hello"
app.message('estore', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
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
					"value": "list_products",
					"action_id": "list_products"
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Review Cart",
						"emoji": true
					},
					"value": "review_cart",
					"action_id": "review_cart"
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Checkout",
						"emoji": true
					},
					"value": "checkout",
					"action_id": "checkout"
				}
			]
		}
    ],
    text: `Hey there <@${message.user}>!`
  });
});

app.action('list_products', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

// Listens to incoming messages that contain "goodbye"
app.message('goodbye', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`See ya later, <@${message.user}> :wave:`);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
