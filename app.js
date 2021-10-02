const { App } = require('@slack/bolt');

const slackSigningSecret = '';
const slackAccessToken = '';


// Initializes your app with your bot token and signing secret
const app = new App({
  token: slackAccessToken,
  signingSecret: slackSigningSecret
});


// Listens to incoming messages that contain "hello"
app.command('/estore', async ({ command, ack, respond }) => {
  // say() sends a message to the channel where the event was triggered

  await ack();
  await respond('test this');
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
