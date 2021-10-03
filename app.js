const { App, LogLevel } = require('@slack/bolt');
const Products = require('./models/products.js');
var products = new Products();

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
    console.log(products.products[0].name + "'s sku number is " + products.products[0].sku);
    await ack();
    say(welcomeView);
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
const productListView = 
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

const welcomeView = { blocks: [{
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