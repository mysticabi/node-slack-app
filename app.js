const { App, LogLevel } = require('@slack/bolt');
const models = require('./models.js')

const slackSigningSecret = '';
const slackAccessToken = '';
const slackAppToken = '';

// Initializes your app with your bot token and signing secret
const app = new App({
  token: slackAccessToken,
  signingSecret: slackSigningSecret,
  logLevel: LogLevel.DEBUG,
  //socketMode:true,
  //appToken: slackAppToken
});

// Listens to incoming messages that contain "hello"
app.command('/estore', async ({ command, ack, say,payload }) => {
    console.log('payload.trigger_id -----> ');
    console.log(payload.trigger_id);
    await ack();
    say(firstView);
});

app.action('list_products', async ({ body, ack, say }) => {
  await ack();
  await say(productListView);
});

app.action('review_cart', async ({ body, ack, say }) => {
await ack();
await say(cartView);

});

app.action('checkout', async ({ body, ack, say }) => {
    await ack();
    await say (checkOutView);
});


        
(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running!');
})();