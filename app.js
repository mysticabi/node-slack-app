const { App, ExpressReceiver, LogLevel } = require('@slack/bolt');

const slackSigningSecret = '';
const slackAccessToken = '';

const expressReceiver = new ExpressReceiver({
    signingSecret: slackSigningSecret,
    processBeforeResponse: true
  });

// Initializes your app with your bot token and signing secret
const app = new App({
  token: slackAccessToken,
  signingSecret: slackSigningSecret,
  logLevel: LogLevel.DEBUG,
  receiver: expressReceiver
});

// Listens to incoming messages that contain "hello"
app.command('/estore', async ({ command, ack, respond }) => {
  ack();
  await respond('test this');
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
