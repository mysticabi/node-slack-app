const { App, LogLevel } = require('@slack/bolt');
const { Product, Cart, UsersContext, User } = require('./models/classes.js');
const { Surfaces, Blocks, Elements, Bits, Utilities, Message, BlockCollection } = require ('slack-block-builder');
const { Modal, Section, Actions, Button, Paginator } = require('slack-block-builder');
const fs = require('fs');
const { BlockBuilderBase } = require('slack-block-builder/dist/base');

let productsMap = new Map();
let usersContext = new UsersContext();

// Slack App secrets and tokens. Move to environment variables.
const slackSigningSecret = '';
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
app.action('list_products', async ({ client, body, ack, say }) => {
    await ack();
    usersContext.userMap.get(body.user.username).userCart.userProductListViewIndex = 1;
    const view = productListView(body.user.username);
    client.views.update({view, view_id: body.view.id});
});

//when "Review Cart" button is clicked 
app.action('review_cart', async ({ body, ack, say }) => {
await ack();
await say(cartView);

});

//when "Check out" button is clicked 
app.action('checkout', async ({ body, ack, say }) => {
    await ack();
    await say (checkOutView);
});


//when "Check out" button is clicked 
app.action('next', async ({ client, body, ack, say }) => {
    await ack();
    if(usersContext.userMap.get(body.user.username).userCart.userProductListViewIndex > 9){
        usersContext.userMap.get(body.user.username).userCart.userProductListViewIndex = 0;
    }
    const view = productListView(body.user.username);
    client.views.update({view, view_id: body.view.id});
});

//when "Check out" button is clicked 
app.action('previous', async ({ body, ack, say }) => {
    await ack();
    await say (checkOutView);
    if(usersContext.userMap.get(body.user.username).userCart.userProductListViewIndex < 4){
        usersContext.userMap.get(body.user.username).userCart.userProductListViewIndex = 0;
    }else{

        const view = productListView(body.user.username);
        client.views.update({view, view_id: body.view.id});
    }
    
});


//when "Add to cart" button is clicked, 
// /addtocart/ is a regex
app.action(/addtocart/, async ({ client, body, payload,ack, say }) => {
    await ack();
    console.log(`User ${body.user.username} added ${body.actions[0].action_id} to cart`);
    const view = getConfirmationDialog(body.actions[0].action_id.split('_')[1], body.user.username);
    client.views.update({view, view_id: body.view.id});
  });

function getConfirmationDialog(sku, user_name){

    usersContext.userMap.get(user_name).userCart.productList.push(productsMap.get(sku))
    return Modal({ title: 'Added to cart' })
    .blocks(
        Blocks.Section({ text: `Your cart Total: ${usersContext.userMap.get(user_name).getCartTotal()}` }),
        Blocks.Actions()
        .elements(
            Elements.Button().text(`List Products (${productsMap.size})`).actionId('list_products').primary(true),
        ))
    .buildToObject();
    
}

//All util functions below

function logMapElements(value, key, map) {
    console.log(`m[${key}] = ${value.name}`);
  }

function welcomeView(userName) {

    return Modal().title('eSwag Modal')
    .blocks(
        Blocks.Divider(),
        Blocks.Header().text(':wave: Hi there, wizard ${userName} :male_mage:! Welcome to eSwag! We have '+ productsMap.size +' wizardry products for you.'),
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
    

    return Modal().title('Product List')
    .blocks(
        Blocks.Divider(),
        BlockCollection().concat(productsBlockForEach(usersContext.userMap.get(userName).userCart.userProductListViewIndex++)),
        BlockCollection().concat(productsBlockForEach(usersContext.userMap.get(userName).userCart.userProductListViewIndex++)),
        BlockCollection().concat(productsBlockForEach(usersContext.userMap.get(userName).userCart.userProductListViewIndex++)),                
        Blocks.Divider(),
        Blocks.Actions()
        .elements(
            Elements.Button().text("Previous").actionId("previous").danger(true),
            Elements.Button().text("Next").actionId("next").primary(true)
        ))
    .close('Done')
    .buildToObject();
}

function productsBlockForEach(index) {

    let sku = 'eSwag0000' + index;
    return BlockCollection().concat(
    
        Blocks.Divider(),
            Blocks.Section({ text: `*${productsMap.get(sku).name}* \n \n${productsMap.get(sku).description} \n Price: ${productsMap.get(sku).price} Galleons` }).accessory(
                    Elements.Img().imageUrl(`${productsMap.get(sku).image}`).altText(`${productsMap.get(sku).name}`))  ,
            Blocks.Section({ text: " " }).accessory(
                    Elements.Button().text(`Add to cart`).actionId(`addtocart_${sku}`).primary(true))); 
}

//All views below
let cartView = 
    {
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Currently available products.*"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*This is a section* \n \nblock with an accessory image."
                },
                "accessory": {
                    "type": "image",
                    "image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
                    "alt_text": "cute cat"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": " "
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Add to Cart",
                        "emoji": true
                    },
                    "value": "click_me_123",
                    "action_id": "button-action"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*This is a section* \n \nblock with an accessory image."
                },
                "accessory": {
                    "type": "image",
                    "image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
                    "alt_text": "cute cat"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": " "
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Add to Cart",
                        "emoji": true
                    },
                    "value": "click_me_123",
                    "action_id": "button-action"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*This is a section* \n \nblock with an accessory image."
                },
                "accessory": {
                    "type": "image",
                    "image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
                    "alt_text": "cute cat"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": " "
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Add to Cart",
                        "emoji": true
                    },
                    "value": "click_me_123",
                    "action_id": "button-action"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Previous",
                            "emoji": true
                        },
                        "value": "previous"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Next",
                            "emoji": true
                        },
                        "value": "next"
                    }
                ]
            }
        ]
    };

let checkOutView = {
	"blocks": [
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*Success* \n \n Your order has been successfully submitted. \n \n "
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Please download the receipt here:"
			},
			"accessory": {
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": "Download receipt",
					"emoji": true
				},
				"value": "click_me_123",
				"url": "https://google.com",
				"action_id": "button-action"
			}
		},
		{
			"type": "divider"
		}
	]
};
        
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



