/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

let SELECTED_DRINK = {};
let CURR_STATE = true;

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the Mixing Drinks skill! What drink would you like to learn how to make?';

    if (supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('Mixing Drinks', speechText)  
        .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            token: "homepage",
            document: require('./launchrequest.json'),
            datasources: require('./sampleDatasourceLR.json')
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('Mixing Drinks', speechText)
        .getResponse();
    }
  },
};

const DrinkIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'DrinkIntent') 
      || (handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
        && handlerInput.requestEnvelope.request.arguments.length > 0
        && handlerInput.requestEnvelope.request.arguments[0] != 'videoEnded');
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    let selectedIndex = 0;
    if (request.type  === 'Alexa.Presentation.APL.UserEvent') {
      selectedIndex = parseInt(request.arguments[0]);
    } else {
      selectedIndex = handlerInput.requestEnvelope.request.intent.slots.drink.resolutions.resolutionsPerAuthority[0].values[0].value.id;
    }

    SELECTED_DRINK = MIXED_DRINKS[selectedIndex];
    const speechText = "To make a " 
        + SELECTED_DRINK.name + ", "
        + SELECTED_DRINK.recipe;

    if (supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('Mixing Drinks', speechText)  
        .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            token: "VideoPlayerToken",
            document: require('./drink.json'),
            datasources: {
              "mixedDrinkData": {
                "properties": {
                  "backgroundImg": "https://s3.amazonaws.com/apl-community-code/drinks/barbackground.jpg",
                  "selectedDrink": SELECTED_DRINK
                }
              }
            }
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt("What other drink do you want to learn about?")
        .withSimpleCard('Mixing Drinks', speechText)
        .getResponse();
    }
  },
};

const OnVideoEndHandler = {
  canHandle(handlerInput) {
    console.log("ARUGMENTS" + JSON.stringify(handlerInput.requestEnvelope));

    return (handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'
        && handlerInput.requestEnvelope.request.arguments.length > 0
        && handlerInput.requestEnvelope.request.arguments[0] === 'videoEnded');
  },
  handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak("What other drink do you want to learn about?")
        .reprompt("What other drink do you want to learn about?")
        .withSimpleCard('Mixing Drinks', "What other drink do you want to learn about?")  
        .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            token: "VideoPlayerToken",
            document: require('./drink.json'),
            datasources: {
              "mixedDrinkData": {
                "properties": {
                  "backgroundImg": "https://s3.amazonaws.com/apl-community-code/drinks/barbackground.jpg",
                  "selectedDrink": SELECTED_DRINK
                }
              }
            }
        })
        .getResponse();
  },
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};


const ResumeAndPauseIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent');
  },
  handle(handlerInput) {
    const speechText = "To make a " 
        + SELECTED_DRINK.name + ", "
        + SELECTED_DRINK.recipe;

    CURR_STATE = !CURR_STATE;

    let playPause = CURR_STATE ? "play" : "pause";

    if (supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
        .speak("")
        .withSimpleCard('Mixing Drinks', speechText)  
        .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            token: "VideoPlayerToken",
            document: require('./drink.json'),
            datasources: {
              "mixedDrinkData": {
                "properties": {
                  "backgroundImg": "https://s3.amazonaws.com/apl-community-code/drinks/barbackground.jpg",
                  "selectedDrink": SELECTED_DRINK
                }
              }
            }
        })
        .addDirective({
              type: "Alexa.Presentation.APL.ExecuteCommands",
              token: "VideoPlayerToken",
              commands: [
                {
                  type: "ControlMedia",
                  componentId: "myVideoPlayer",
                  command: playPause
                }
              ]
          })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt("What other drink do you want to learn about?")
        .withSimpleCard('Mixing Drinks', speechText)
        .getResponse();
    }
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log("WHOLE ERROR" + JSON.stringify(error));
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

function supportsAPL(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface != null && aplInterface != undefined;
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    DrinkIntentHandler,
    OnVideoEndHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    ResumeAndPauseIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

  const MIXED_DRINKS = [
    {
      "name": "Gin and Tonic",
      "videoSrc": "https://s3.amazonaws.com/apl-community-code/drinks/ginandtonic.mp4",
      "imgSrc": "https://s3.amazonaws.com/apl-community-code/drinks/ginandtonic.jpeg",
      "ingredients": [
        {
          "name": "Gin",
          "amount": "1 part"
        },
        {
          "name": "Tonic",
          "amount": "3 parts"
        },
        {
          "name": "Lime",
          "amount": "Optional, one slice"
        }
      ],
      "recipe": "In a glass filled with ice cubes, add gin and tonic. Squeeze lime."
    },
    {
      "name": "Gin Punch",
      "videoSrc": "https://s3.amazonaws.com/apl-community-code/drinks/ginpunch.mp4",
      "imgSrc": "https://s3.amazonaws.com/apl-community-code/drinks/ginpunch.jpeg",
      "ingredients": [
        {
          "name": "Lemons",
          "amount": "3 whole"
        },
        {
          "name": "Sugar",
          "amount": "1/3 cup"
        },
        {
          "name": "Gin",
          "amount": "1 750 mL bottle"
        },
        {
          "name": "Orange liqueur",
          "amount": "1/2 cup"
        },
        {
          "name": "Tonic",
          "amount": "1 liter"
        }
      ],
      "recipe": "Use a vegetable peeler to peel long strips of pith-free skin from the lemons. Place peels in a bowl, add sugar, muddle vigorously and allow to steep 2 to 3 hours. Juice lemons to obtain 3/4 cup. Pour lemon juice over peels and stir to dissolve sugar. Transfer to a 3-quart pitcher half-filled with ice. Add gin, liqueur and seltzer. Stir and pour into punch cups or short-stemmed glasses, and serve."
    },
    {
      "name": "Hot Buttered Rum",
      "videoSrc": "https://s3.amazonaws.com/apl-community-code/drinks/hotbutteredrum.mp4",
      "imgSrc": "https://s3.amazonaws.com/apl-community-code/drinks/hotbutteredrum.jpeg",
      "ingredients": [
        {
          "name": "",
          "amount": ""
        }
      ],
      "recipe": ""
    },
    {
      "name": "Margarita",
      "videoSrc": "",
      "imgSrc": "",
      "ingredients": [
        {
          "name": "",
          "amount": ""
        }
      ],
      "recipe": ""
    },
    {
      "name": "Martini",
      "videoSrc": "",
      "imgSrc": "",
      "ingredients": [
        {
          "name": "",
          "amount": ""
        }
      ],
      "recipe": ""
    },
    {
      "name": "Mojito",
      "videoSrc": "",
      "imgSrc": "",
      "ingredients": [
        {
          "name": "",
          "amount": ""
        }
      ],
      "recipe": ""
    },
    {
      "name": "Moscow Mule",
      "videoSrc": "",
      "imgSrc": "",
      "ingredients": [
        {
          "name": "",
          "amount": ""
        }
      ],
      "recipe": ""
    },
    {
      "name": "Negroni",
      "videoSrc": "",
      "imgSrc": "",
      "ingredients": [
        {
          "name": "",
          "amount": ""
        }
      ],
      "recipe": ""
    },
    {
      "name": "Old Fashioned",
      "videoSrc": "",
      "imgSrc": "",
      "ingredients": [
        {
          "name": "",
          "amount": ""
        }
      ],
      "recipe": ""
    },
    {
      "name": "Spiked Egg Nog",
      "videoSrc": "",
      "imgSrc": "",
      "ingredients": [
        {
          "name": "",
          "amount": ""
        }
      ],
      "recipe": ""
    }
  ];












