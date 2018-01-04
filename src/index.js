'use strict';
const Alexa = require('alexa-sdk');
const APP_ID = undefined;

/***********
Data: Customize the data below as you please.
***********/

const SKILL_NAME = "Personality Quiz";
const HELP_MESSAGE_BEFORE_START = "Find your spirit animal. Answer 5 yes or no questions and I'll tell you. Are you ready to play?";
const HELP_MESSAGE_AFTER_START = "Respond yes or no and I'll give you the result at the end.";
const HELP_REPROMPT = "I will reveal your spirit animal after you answer 5 questions.";
const STOP_MESSAGE = "Try again another time.";
const CANCEL_MESSAGE = "Let's start again.";
const MISUNDERSTOOD_INSTRUCTIONS_ANSWER = "Please answer with either yes or no.";

const WELCOME_MESSAGE = "Hi! I can tell you your spirit animal. All you have to do is answer five simple yes or no questions. Are you ready to start?";
const INITIAL_QUESTION_INTROS = [
  "Great! Let's start!",
  "Ok let's begin.",
  "<say-as interpret-as='interjection'>Alrighty</say-as>! Here comes the first question!",
  "Ok let's go. <say-as interpret-as='interjection'>Ahem</say-as>.",
  "<say-as interpret-as='interjection'>Let's go</say-as>."
];
const QUESTION_INTROS = [
  "I see.",
  "Okey Dokey",
  "That's right!",
  "Yup.",
  "I would have said that too.",
  "I'm getting the idea of it.",
  "I knew it.",
  "Totally agree.",
  "I agree."
];
const UNDECISIVE_RESPONSES = [
  "Alright. I'll just choose for you.",
  "I picked an answer for you.",
  "Ok, I'll guess on that one.",
  "We'll just move on then.",
  "How about this question?",
];
const RESULT_MESSAGE = "This is it, the big reveal! You are a"; // the name of the result is inserted here.
const PLAY_AGAIN_REQUEST = "That's it. Do you want to play again?";

const animalList = {
  fox: {
    name: "a Fox",
    display_name: "Fox",
    audio_message: "You're a quick thinker and are adaptable. You're Responsive and sometimes cunning, it's great to be a fox when you're facing tricky situations.",
    description: "Foxes are known for being tricksters, however as a spirit animal, they can be called upon to solve problems with their quick thinking and creative spirit. Foxes are excellent teachers and mentors, providing guidance on swiftly finding your way around obstacles.",
    img: {
      smallImageUrl: "https://image.ibb.co/c4hSHG/Foxsmall.png",
      largeImageUrl: "https://image.ibb.co/iq9UWb/Foxlarge.png"
    }
  },
  owl: {
    name: "an Owl",
    display_name: "Owl",
    audio_message: "As an owl you can see beyond what is visible to the truth. You have a strong intuition and can access information and wisdom that’s usually hidden to most.",
    description: "Owls have long since been a symbol of wisdom, but as your spirit animal it gives you strength to see the truth when it is hidden. Owls have great intuition and guide you to high awareness.",
    img: {
      smallImageUrl: "https://image.ibb.co/iZ8Orb/Owlsmall.png",
      largeImageUrl: "https://image.ibb.co/fKvQ4w/Owllarge.png"
    }
  },
  wolf: {
    name: "a Wolf",
    display_name: "Wolf",
    audio_message: "You have sharp intelligence and strong instincts. You live your life byu instinct and value the ability to think freely.",
    description: "As a wolf you have the ability to make quick and firm emotional attachments, and often need to trust your instincts to make decisions. Wolves teach us to trust our hearts and minds, and have control over our lives.",
    img: {
      smallImageUrl: "https://image.ibb.co/grVQMb/Wolfsmall.png",
      largeImageUrl: "https://image.ibb.co/dCg9Wb/Wolflarge.png"
    }
  },
  bear: {
    name: "a Bear",
    display_name: "Bear",
    audio_message: "Baaa! You are a goat.",
    description: "Goats are some of the most amazing animals on Earth. Constantly underestimated, they are nearly as impervious to other peoples' opinions as honey badgers. You are quite handy to have around, as you're always happy to take care of leftovers at any party.",
    img: {
      smallImageUrl: "https://image.ibb.co/dvPJPw/Bearsmall.png",
      largeImageUrl: "https://image.ibb.co/guVgcG/Bearlarge.png"
    }
  },
  hawk: {
    name: "a Hawk",
    display_name: "Hawk",
    audio_message: "You dig relaxing and hanging around in the sunshine.",
    description: "You are athletic and cool, the apple of everyone's eye. You really know how to take it easy and like to spend lots of time basking in the sun and enjoying the great outdoors. When you want to, you can be quite fast and nimble. You're always the first pick for team sports.",
    img: {
      smallImageUrl: "https://image.ibb.co/etGXjw/Hawksmall.png",
      largeImageUrl: "https://image.ibb.co/di3ZxG/Hawklarge.png"
    }
  }
};

const questions = [
  {
    question: "Do you like spending time socializing with others?",
    points: {
      Fox: ,
      Owl: ,
      Wolf: ,
      Bear: ,
      Hawk: 
    }
  },
  {
    question: "Do you enjoy sunbathing?",
    points: {
      Fox: ,
      Owl: ,
      Wolf: ,
      Bear: ,
      Hawk: 
    }
  },
  {
    question: "Do you enjoy reading a good book more than going out to a party?",
    points: {
      Fox: ,
      Owl: ,
      Wolf: ,
      Bear: ,
      Hawk: 
    }
  },
  {
    question: "Do you like doing sports?",
    points: {
      Fox: ,
      Owl: ,
      Wolf: ,
      Bear: ,
      Hawk: 
    }
  },
  {
    question: "Do you prefer vacationing in the forest instead of on the beach?",
    points: {
      Fox: ,
      Owl: ,
      Wolf: ,
      Bear: ,
      Hawk: 
    }
  }
];

/***********
Execution Code: Avoid editing the code below if you don't know JavaScript.
***********/

// Private methods (this is the actual code logic behind the app)

const _initializeApp = handler => {
  // Set the progress to -1 one in the beginning
  handler.attributes['questionProgress'] = -1;
  // Assign 0 points to each animal
  var initialPoints = {};
  Object.keys(animalList).forEach(animal => initialPoints[animal] = 0);
  handler.attributes['animalPoints'] = initialPoints;
};

const _nextQuestionOrResult = (handler, prependMessage = '') => {
  if(handler.attributes['questionProgress'] >= (questions.length - 1)){
    handler.handler.state = states.RESULTMODE;
    handler.emitWithState('ResultIntent', prependMessage);
  }else{
    handler.emitWithState('NextQuestionIntent', prependMessage);
  }
};

const _applyAnimalPoints = (handler, calculate) => {
  const currentPoints = handler.attributes['animalPoints'];
  const pointsToAdd = questions[handler.attributes['questionProgress']].points;

  handler.attributes['animalPoints'] = Object.keys(currentPoints).reduce((newPoints, animal) => {
    newPoints[animal] = calculate(currentPoints[animal], pointsToAdd[animal]);
    return newPoints;
  }, currentPoints);
};

const _randomQuestionIntro = handler => {
  if(handler.attributes['questionProgress'] == 0){
    // return random initial question intro if it's the first question:
    return _randomOfArray(INITIAL_QUESTION_INTROS);
  }else{
    // Assign all question intros to remainingQuestionIntros on the first execution:
    var remainingQuestionIntros = remainingQuestionIntros || QUESTION_INTROS;
    // randomQuestion will return 0 if the remainingQuestionIntros are empty:
    let randomQuestion = remainingQuestionIntros.splice(_randomIndexOfArray(remainingQuestionIntros), 1);
    // Remove random Question from rameining question intros and return the removed question. If the remainingQuestions are empty return the first question:
    return randomQuestion ? randomQuestion : QUESTION_INTROS[0];
  }
};

const _randomIndexOfArray = (array) => Math.floor(Math.random() * array.length);
const _randomOfArray = (array) => array[_randomIndexOfArray(array)];
const _adder = (a, b) => a + b;
const _subtracter = (a, b) => a - b;

// Handle user input and intents:

const states = {
  QUIZMODE: "_QUIZMODE",
  RESULTMODE: "_RESULTMODE"
}

const newSessionHandlers = {
  'NewSession': function(){
    _initializeApp(this);
    this.emit(':askWithCard', WELCOME_MESSAGE, SKILL_NAME, WELCOME_MESSAGE);
    //                         ^speechOutput,   ^cardTitle, ^cardContent,   ^imageObj
  },
  'YesIntent': function(){
    this.handler.state = states.QUIZMODE;
    _nextQuestionOrResult(this);
  },
  'NoIntent': function(){
    this.emitWithState('AMAZON.StopIntent');
  },
  'AMAZON.HelpIntent': function(){
    this.emit(':askWithCard', HELP_MESSAGE_BEFORE_START, HELP_REPROMPT, SKILL_NAME);
  },
  'AMAZON.CancelIntent': function(){
    this.emitWithState('AMAZON.StopIntent');
  },
  'AMAZON.StopIntent': function(){
    this.emit(':tellWithCard', STOP_MESSAGE, SKILL_NAME, STOP_MESSAGE);
  },
  'Unhandled': function(){
    this.emit(':ask', MISUNDERSTOOD_INSTRUCTIONS_ANSWER);
  }
};


const quizModeHandlers = Alexa.CreateStateHandler(states.QUIZMODE, {
  'NextQuestionIntent': function(prependMessage = ''){
    // Increase the progress of asked questions by one:
    this.attributes['questionProgress']++;
    // Reference current question to read:
    var currentQuestion = questions[this.attributes['questionProgress']].question;

    this.emit(':askWithCard', `${prependMessage} ${_randomQuestionIntro(this)} ${currentQuestion}`, HELP_MESSAGE_AFTER_START, SKILL_NAME, currentQuestion);
    //                        ^speechOutput                                                         ^repromptSpeech           ^cardTitle  ^cardContent     ^imageObj
  },
  'YesIntent': function(){
    _applyAnimalPoints(this, _adder);
    // Ask next question or return results when answering the last question:
    _nextQuestionOrResult(this);
  },
  'NoIntent': function(){
    // User is responding to a given question
    _applyAnimalPoints(this, _subtracter);
    _nextQuestionOrResult(this);
  },
  'UndecisiveIntent': function(){
    // Randomly apply
    Math.round(Math.random()) ? _applyAnimalPoints(this, _adder) : _applyAnimalPoints(this, _subtracter);
    _nextQuestionOrResult(this, _randomOfArray(UNDECISIVE_RESPONSES));
  },
  'AMAZON.RepeatIntent': function(){
    var currentQuestion = questions[this.attributes['questionProgress']].question;

    this.emit(':askWithCard', currentQuestion, HELP_MESSAGE_AFTER_START, SKILL_NAME, currentQuestion);
    //                        ^speechOutput    ^repromptSpeech           ^cardTitle ^cardContent     ^imageObj
  },
  'AMAZON.HelpIntent': function(){
    this.emit(':askWithCard', HELP_MESSAGE_AFTER_START, HELP_REPROMPT, SKILL_NAME);
  },
  'AMAZON.CancelIntent': function(){
    this.emit(':tellWithCard', CANCEL_MESSAGE, SKILL_NAME, CANCEL_MESSAGE);
  },
  'AMAZON.StopIntent': function(){
    this.emit(':tellWithCard', STOP_MESSAGE, SKILL_NAME, STOP_MESSAGE);
  },
  'Unhandled': function(){
    this.emit(':ask', MISUNDERSTOOD_INSTRUCTIONS_ANSWER);
  }
});


const resultModeHandlers = Alexa.CreateStateHandler(states.RESULTMODE, {
  'ResultIntent': function(prependMessage = ''){
    // Determine the highest value:
    const animalPoints = this.attributes['animalPoints'];
    const result = Object.keys(animalPoints).reduce((o, i) => animalPoints[o] > animalPoints[i] ? o : i);
    const resultMessage = `${prependMessage} ${RESULT_MESSAGE} ${animalList[result].name}. ${animalList[result].audio_message}. ${PLAY_AGAIN_REQUEST}`;

    this.emit(':askWithCard', resultMessage, PLAY_AGAIN_REQUEST, animalList[result].display_name, animalList[result].description, animalList[result].img);
    //                        ^speechOutput  ^repromptSpeech     ^cardTitle                       ^cardContent                    ^imageObj
  },
  'YesIntent': function(){
    _initializeApp(this);
    this.handler.state = states.QUIZMODE;
    _nextQuestionOrResult(this);
  },
  'NoIntent': function(){
    this.emitWithState('AMAZON.StopIntent');
  },
  'AMAZON.HelpIntent': function(){
    this.emit(':askWithCard', HELP_MESSAGE_AFTER_START, HELP_REPROMPT, SKILL_NAME);
  },
  'AMAZON.CancelIntent': function(){
    this.emitWithState('AMAZON.StopIntent');
  },
  'AMAZON.StopIntent': function(){
    this.emit(':tellWithCard', STOP_MESSAGE, SKILL_NAME, STOP_MESSAGE);
  },
  'Unhandled': function(){
    this.emit(':ask', MISUNDERSTOOD_INSTRUCTIONS_ANSWER);
  }
});



exports.handler = (event, context, callback) => {
  const alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(newSessionHandlers, quizModeHandlers, resultModeHandlers);
  alexa.execute();
};
