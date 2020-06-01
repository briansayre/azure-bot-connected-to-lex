// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    TurnContext,
    MessageFactory,
    TeamsInfo,
    TeamsActivityHandler,
    CardFactory,
    ActionTypes
} = require('botbuilder');
const TextEncoder = require('util').TextEncoder;

const AWS = require('aws-sdk')

AWS.config.update({
    region: 'us-east-1',
    accessKeyId:  process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
});

let Lex= new AWS.LexRuntime();
let reply = '';

class EchoBot extends TeamsActivityHandler {
    
    constructor() {
        
        super();
        
        this.onMessage( async (context, next) => {

            TurnContext.removeRecipientMention(context.activity);
            await this.callLex(context);
            await this.sleep(1000);
            await context.sendActivity(MessageFactory.text(reply));
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'BEP Demo is ready';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            await next();
        });
        
    }
    
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async callLex(context) {
            
        var params = {
            botAlias: 'BEP',
            botName: 'help_desk_bot',
            userId: context.activity.from.id,
            inputText: context.activity.text.trim()
        }
        
        Lex.postText(params, (err, data) => {
          if (err) {
            console.log("Error\n", err);
          } else {
            reply = data.message;
            console.log("Reply: ", reply);
          }
        });
        
    }
    
    
}

module.exports.EchoBot = EchoBot;
