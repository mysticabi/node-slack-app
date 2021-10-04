const { App, LogLevel } = require('@slack/bolt');
const { Product, Carts } = require('./models/classes.js');
const fs = require('fs');

//Load products to the memory (acts as Catalog DB)
var productsMap = new Map();
fs.readFile('./data/products.json',
// callback function that is called when reading file is done
function(err, data) {       
    // json data
    console.log(data);
    var jsonData = data;
    // parse json
    JSON.parse(jsonData).products.forEach(i =>{
        productsMap.set(i.sku, new Product(i.sku, i.name, i.description, i.brand, i.image, i.price));
    });
    productsMap.forEach(logMapElements);
    
});


// Slack App secrets and tokens. Move to environment variables.
const slackSigningSecret = '4f5bc0a746b803da2eedc471ecd45d5c';
const slackAccessToken = 'xoxb-2491257843379-2566898424480-CGXHcO3SWjQktQy59EdRyUW1';
const slackAppToken = '';

// Initializes slack app on Bolt Framework.
const app = new App({
  token: slackAccessToken,
  signingSecret: slackSigningSecret,
  logLevel: LogLevel.DEBUG,
});

// handler for slash command "/estore"
app.command('/estore', async ({ command, ack, say,payload }) => {
    productsMap.forEach(logMapElements);
    await ack();
    //show first view or welcome view.
    say(welcomeView);
});

//when "List Products" button is clicked 
// show the different list of products
app.action('list_products', async ({ body, ack, say }) => {
  await ack();
  await say(productListView);
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

//when "Add to cart" button is clicked, 
// /addtocart/ is a regex
app.action(/addtocart/, async ({ body, payload,ack, say }) => {
    await ack();
    console.log(`User ${body.user.username} added ${body.actions[0].action_id} to cart`);
    await say("added to cart");
  });


//All util functions below

function logMapElements(value, key, map) {
    console.log(`m[${key}] = ${value.name}`);
  }



//All views below
const cartView = 
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
var productListView = 
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
                        "action_id": "addtocart_1"
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
                        "action_id": "addtocart_2"
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
                        "action_id": "addtocart_3"
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

const welcomeView = { blocks: [{
    "type": "header",
    "text": {
        "type": "plain_text",
        "text": "Welcome to eSwag! We have "+ productsMap.size +" wizardry products for you."
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
    }] 
};

const checkOutView = {
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
    // Start your app
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running!');
})();



