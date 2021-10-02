const { App, LogLevel } = require('@slack/bolt');

const slackSigningSecret = '';
const slackAccessToken = '';


// Initializes your app with your bot token and signing secret
const app = new App({
  token: slackAccessToken,
  signingSecret: slackSigningSecret,
  logLevel: LogLevel.DEBUG
});

// Listens to incoming messages that contain "hello"
app.command('/estore', async ({ command, ack, say }) => {

    await ack();
    let message = { blocks: [{
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
    }] };

});

app.action('list_products', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
