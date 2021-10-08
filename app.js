const { App, LogLevel } = require('@slack/bolt');
const { Product, Cart, UsersContext, User, Order } = require('./models/classes.js');
const { Surfaces, Blocks, Elements, Bits, Utilities, Message, BlockCollection, user, channel } = require ('slack-block-builder');
const { Modal, Section, Actions, Button, Paginator } = require('slack-block-builder');
const fs = require('fs');
const { BlockBuilderBase } = require('slack-block-builder/dist/base');
const { conversations } = require('slack');
var request = require('request');

let orders = 10000;
let productsMap = new Map();
let activeOrdersMap = new Map();
let processedOrdersMap = new Map();
let usersContext = new UsersContext();

// Slack App secrets and tokens. Move to environment variables.
const slackSigningSecret = '4f5bc0a746b803da2eedc471ecd45d5c';
const slackAccessToken = '';
const slackAppToken = '';

// Initializes slack app on Bolt Framework.
const app = new App({
  token: slackAccessToken,
  signingSecret: slackSigningSecret,
  logLevel: LogLevel.DEBUG,
});

// handler for slash command "/estore"
app.command('/estore', async ({client, body, command, ack, say, payload }) => {
    await ack();

    //check if user info exist in the usersContext
    if(!usersContext.userMap.has(command.user_name)){
        usersContext.userMap.set(command.user_name, new User(command.user_name));
    }
    //show first view or welcome view.
    //say(welcomeView(command.user_name));
    const view = welcomeView(command.user_name);
    client.views.open({view, trigger_id: body.trigger_id});
});

//when "List Products" button is clicked 
// show the different list of products
app.action('list_products', async ({ client, body, ack }) => {
    await ack();
    usersContext.userMap.get(body.user.username).userCart.userProductListViewIndex = 1;
    const view = productListView(body.user.username);
    client.views.update({view, view_id: body.view.id});
});

//when "Review Cart" button is clicked 
app.action('review_cart', async ({ body, ack, client }) => {
await ack();
const view = reviewCartView(body.user.username);
client.views.update({view, view_id: body.view.id});

});

//when "Check out" button is clicked 
app.action('checkout', async ({ body, ack, client }) => {
    await ack();
    const view = checkoutView(body.user.username);
    client.views.update({view, view_id: body.view.id});    
});
//confirm_checkout
//when "Check out" button is clicked 
app.action('confirm_checkout', async ({ body, ack, client, say }) => {
    await ack();
    let userOrderNum = orders++;
    let userName = body.user.username;
    let userOrder = new Order(usersContext.userMap.get(userName).userCart.productList, userName, usersContext.userMap.get(userName).getCartTotal(), body.user.id);
    activeOrdersMap.set(userOrderNum, userOrder);
    client.chat.postMessage(omsMessage(userName, userOrder, userOrderNum));
    const view = confirmationView(userName);
    client.views.update({view, view_id: body.view.id}); 
    client.chat.postMessage(sendConfirmationToUser(client, userOrderNum, userName, body.user.id));
    usersContext.userMap.delete(userName);
});
//when "Check out" button is clicked 
app.action('next', async ({ client, body, ack }) => {
    await ack();
    if(usersContext.userMap.get(body.user.username).userCart.userProductListViewIndex >= 9){
        usersContext.userMap.get(body.user.username).userCart.userProductListViewIndex = 1;
    }
    const view = productListView(body.user.username);
    client.views.update({view, view_id: body.view.id});
});

//when "Check out" button is clicked 
app.action('previous', async ({ body, ack, client }) => {
    await ack();
    //Below logic needs changing. Quick and Dirty logic!
    if(usersContext.userMap.get(body.user.username).userCart.userProductListViewIndex <= 4){
        usersContext.userMap.get(body.user.username).userCart.userProductListViewIndex = 7;
    }else if(usersContext.userMap.get(body.user.username).userCart.userProductListViewIndex == 10){
        usersContext.userMap.get(body.user.username).userCart.userProductListViewIndex = 4;
    }
    else{
        usersContext.userMap.get(body.user.username).userCart.userProductListViewIndex = 1;
    }
    const view = productListView(body.user.username);
    client.views.update({view, view_id: body.view.id});
});


//when "Add to cart" button is clicked, 
// /addtocart/ is a regex
app.action(/addtocart/, async ({ client, body, payload,ack, say }) => {
    await ack();
    console.log(`User ${body.user.username} added ${body.actions[0].action_id} to cart`);
    const view = getConfirmationDialog(body.actions[0].action_id.split('_')[1], body.user.username);
    client.views.update({view, view_id: body.view.id});
  });

app.action(/process/, async ({ client, body,ack, say }) => {
    await ack();
    let orderNumber = body.actions[0].action_id.split('_')[1];
    let userName = activeOrdersMap.get(Number(orderNumber)).userName;
    let userID = activeOrdersMap.get(Number(orderNumber)).userID;
    console.log(`User ${userName}'s order is processed`);
    say(`Order # ${orderNumber} processed and wizard ${userName} notified`);
    client.chat.postMessage(sendProcessedMessage(client, orderNumber, userName, userID));
    processedOrdersMap.set(Number(orderNumber), activeOrdersMap.get(Number(orderNumber)));
    activeOrdersMap.delete(Number(orderNumber));
});

// Begin ::  All view render Funtions 
function getConfirmationDialog(sku, user_name){

    usersContext.userMap.get(user_name).userCart.productList.push(productsMap.get(sku))
    return Modal({ title: 'Added to cart' })
    .blocks(
        Blocks.Section({ text: `Your cart Total: ${usersContext.userMap.get(user_name).getCartTotal()} Galleons` }),
        Blocks.Actions()
        .elements(
            Elements.Button().text(`Go Back To Products (${productsMap.size})`).actionId('list_products').primary(true),
            Elements.Button().text(`Review Cart (${usersContext.userMap.get(user_name).userCart.productList.length})`).actionId('review_cart').primary(true),
            Elements.Button().text(`Checkout (${usersContext.userMap.get(user_name).getCartTotal()})`).actionId('checkout').danger(true)
        ))
    .buildToObject();
    
}


function welcomeView(userName) {

    return Modal().title('eSwag: Employee Store')
    .blocks(
        Blocks.Divider(),
        Blocks.Header().text(`:wave: Hi there, wizard ${userName} :male_mage:! Welcome to eSwag! We have ${productsMap.size} wizardry products for you. :magic_wand:`),
        Blocks.Divider(),
        Blocks.Actions()
        .elements(
            Elements.Button().text(`List Products (${productsMap.size})`).actionId('list_products').primary(true),
            Elements.Button().text(`Review Cart (${usersContext.userMap.get(userName).userCart.productList.length})`).actionId('review_cart').primary(true),
            Elements.Button().text(`Checkout (${usersContext.userMap.get(userName).getCartTotal()})`).actionId('checkout').danger(true)
        ))
    .close('Done')
    .buildToObject();
}

function productListView(userName) {
    return Modal().title('Wizard products')
    .blocks(
        Blocks.Divider(),
        BlockCollection().concat(productsBlocksBuilder(usersContext.userMap.get(userName).userCart.userProductListViewIndex++)),
        BlockCollection().concat(productsBlocksBuilder(usersContext.userMap.get(userName).userCart.userProductListViewIndex++)),
        BlockCollection().concat(productsBlocksBuilder(usersContext.userMap.get(userName).userCart.userProductListViewIndex++)),                
        Blocks.Divider(),
        Blocks.Actions()
        .elements(
            Elements.Button().text("Previous").actionId("previous").danger(true),
            Elements.Button().text("Next").actionId("next").primary(true),
            Elements.Button().text(`Review Cart (${usersContext.userMap.get(userName).userCart.productList.length})`).actionId('review_cart').primary(true),
            Elements.Button().text(`Checkout (${usersContext.userMap.get(userName).getCartTotal()})`).actionId('checkout').danger(true)
        ))
    .close('Done')
    .buildToObject();
}

function reviewCartView(userName) {
    return Modal().title('Your cart items!')
    .blocks(
        Blocks.Divider(),
        Blocks.Section({ text: cartViewTextBuilder(userName) }),   
        Blocks.Divider(),
        Blocks.Section({ text: `Cart Total :  ${usersContext.userMap.get(userName).getCartTotal()} Galleons`}),               
        Blocks.Divider(),
        Blocks.Actions()
        .elements(
            Elements.Button().text(`Go Back To Products (${productsMap.size})`).actionId('list_products').primary(true),
            Elements.Button().text(`Checkout (${usersContext.userMap.get(userName).getCartTotal()})`).actionId('checkout').danger(true)
        ))
    .close('Done')
    .buildToObject();
}


function checkoutView(userName) {
    return Modal().title('Checkout')
    .blocks(
        Blocks.Divider(),
        Blocks.Section({ text: `Cart Total :  ${usersContext.userMap.get(userName).getCartTotal()} Galleons`}),               
        Blocks.Divider(),
        Blocks.Actions()
        .elements(
            Elements.Button().text('Confirm Checkout').actionId('confirm_checkout').danger(true),
            Elements.Button().text(`Go Back To Products (${productsMap.size})`).actionId('list_products').primary(true),
            Elements.Button().text(`Review Cart (${usersContext.userMap.get(userName).userCart.productList.length})`).actionId('review_cart').primary(true)
        ))
    .close('Done')
    .buildToObject();
}

function confirmationView(userName) {
    
    return Modal().title('Checkout Complete')
    .blocks(
        Blocks.Divider(),
        Blocks.Section({ text: `${usersContext.userMap.get(userName).getCartTotal()} Galleons, will be deducted from your preferred payment method. \n You will be contacted by the fulfillment team soon! \nYour Order # is : ${orders}`}),               
        Blocks.Divider())
    .close('Done')
    .buildToObject();
}



// End ::  All view render Funtions 
//## Utility Funtions ##
// Begin ::  All blocks and text generating Funtions 
// Products List Blocks Builder 
function productsBlocksBuilder(index) {

    let sku = 'eSwag0000' + index;
    return BlockCollection().concat(
        Blocks.Divider(),
            Blocks.Section({ text: `*${productsMap.get(sku).name}* \n \n${productsMap.get(sku).description} \n Price: ${productsMap.get(sku).price} Galleons` }).accessory(
                    Elements.Img().imageUrl(`${productsMap.get(sku).image}`).altText(`${productsMap.get(sku).name}`))  ,
            Blocks.Section({ text: " " }).accessory(
                    Elements.Button().text(`Add to cart`).actionId(`addtocart_${sku}`).primary(true))); 
}

// Cart View Text Builder
function cartViewTextBuilder(userName) {
    let cartContent = '';

    if(usersContext.userMap.get(userName).userCart.productList.length == 0){
        cartContent = 'Cart is Empty';
    }
    else{
        usersContext.userMap.get(userName).userCart.productList.forEach(element => {
        cartContent += productsMap.get(element.sku).name + " by " + productsMap.get(element.sku).brand+ " : " + productsMap.get(element.sku).price + " Galleons";
        cartContent += '\n'
        });   
    }   
    return cartContent; 
    
}

function sendConfirmationToUser(client, orderNum, userName, userID){
    //The below channel logic is not working, so hardcoding the user channel
    /*let channelID = await getChannelID(client, userID)
    console.log('in sendConfirmationToUser');
    console.log(channelID);*/

    return Message().channel('D02GNSECT2L').text(`${userName}'s order: ${orderNum} --> Confirmed`).blocks(Blocks.Section().text(`${userName}'s order: ${orderNum} --> Confirmed`),Blocks.Divider()).buildToObject();
}

function sendProcessedMessage(client, orderNum, userName, userID){
    //The below channel logic is not working, so hardcoding the user channel
    /*let channelID = await getChannelID(client, userID)
    console.log('in sendConfirmationToUser');
    console.log(channelID);*/

    return Message().channel('D02GNSECT2L').text(`Wizard ${userName} :male_mage:, your order ${orderNum} is processed.`).blocks(Blocks.Section().text(`Wizard ${userName} :male_mage:, your order ${orderNum} is processed.`),Blocks.Divider()).buildToObject();
}

async function getChannelID(client, userID) {

    let results = await client.conversations.open ({
        users: userID
    });
    console.log('in getChannelID');
    console.log(results.channel.id);
    return results.channel.id;
    
}



function omsMessage(userName, userOrder, userOrderNum){
    let orderDetails = 'Order Details\nUser: '+ userName+ '\nOrder # : ' + userOrderNum+ '\n';
    userOrder.skuList.forEach(element => {
        orderDetails += element.sku +' : ' + element.name;
        orderDetails += '\n';
    });

    return Message()
    .channel('C02H4A7FEN9')
    .text(`${userName}'s order: ${userOrderNum}'`)
    .blocks(
      Blocks.Section()
        .text(orderDetails),
      Blocks.Divider(),
      Blocks.Actions()
        .elements(
          Elements.Button()
            .text('Process Order')
            .actionId(`process_${userOrderNum}`)
            .danger(true)))
    .buildToObject();
}


function logMapElements(value, key, map) {
    console.log(`m[${key}] = ${value.name}`);
  }

        
(async () => {
    //Load products to the memory (acts as Catalog DB)
    // Start your app
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running!');
    
    //Populat Store Details
    fs.readFile('./data/products.json',
    // callback function that is called when reading file is done
    function(err, data) {       
        // json data
        console.log(data);
        const jsonData = data;
        // parse json
        JSON.parse(jsonData).products.forEach(i =>{
            productsMap.set(i.sku, new Product(i.sku, i.name, i.description, i.brand, i.image, i.price));
        });
        productsMap.forEach(logMapElements);
        
    });

})();



