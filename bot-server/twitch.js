const irc = require('irc-upd');
const WebSocket = require('ws');
const disp = require('../user-interface/display.js');
const db = require('../database/database.js');
const ck = require('../database/cookies.js');
const ta = require('./twitch-authenticate.js');
const clientID = 'yblspem7dabcfdv0nk918jaq8a70yb';

var bot_id;
var user_id;
var token;
var authToken;
var botNick;
var userChannel;
var nonce;

var heartbeat;
var userEnded = false;

let ws;
var whisperEvent;
var wsSuccess = false;
var wsRetryChecker;

var wsTopic;

let ircClient;
var ircSuccess = false;

const ping = {
    "type": "PING"
};
const pong = {
    "type": "PONG"
};

function startWS(callback) {
    ws = new WebSocket('wss://pubsub-edge.twitch.tv');

    ws.on('open', function () {

        console.log('WS Connection Open!');
        ws.send(JSON.stringify(
            {
                "type": "LISTEN",
                "nonce": nonce,
                "data": {
                    "topics": [whisperEvent],
                    "auth_token": token
                }
            }
        ));

        startIRC(callback);

        heartbeat = setInterval(function () {
            ws.send(JSON.stringify(ping));
        }, (60 * 1000));
    });

    ws.on('message', function (e) {
        console.log(e);
        if (e) {
            var event = JSON.parse(e);
            //console.log(event);
            if ((event.nonce + "") == nonce && event.type == 'RESPONSE') {
                console.log('Response From TWITCH!');
            }

            if (event.type + '' == 'MESSAGE') {
                console.log('Message from TWITCH!');
                switch (event.data.topic + '') {
                    case whisperEvent:
                        //console.log('Whisper Received!');
                        var parsed = JSON.parse(event.data.message);
                        var message = JSON.parse(parsed.data);
                        //console.log(message.tags.color);
                        console.log(message.nonce);
                        console.log('Whisper Received from TWITCH!');

                        console.log("Whisper from " + message.tags.display_name + ": " + message.body);

                        gotWhisper(message.tags.login, message.body);

                        break;

                    default:
                        break;
                }
            }
        }
    });
}

    //TODO: Fix this!
module.exports.connect = function(callback){

    ck.getCookie('twitchBotInfo', function (cookie) {
        db.getSettings(function(settings){
            bot_id = settings.bot_id;
            whisperEvent = "whispers." + bot_id;
            user_id = settings.streamer_id;
            token = cookie.accessToken;
            authToken = ("oauth:" + token);
            botNick = settings.bot_nick;
            userChannel = settings.user;
            userChannel = "#" + userChannel.toLowerCase();
            //userChannel = userChannel.toLowerCase();
            nonce = ta.generateNonce();
            console.log("botID - " + bot_id);
            startWS(callback);
        });
    });
};

module.exports.disconnect = function(callback){
    ircClient.disconnect();
    ws.terminate();
};

function startIRC(callback){

    console.log('Starting IRC');

    ircClient = new irc.Client('irc.chat.twitch.tv', botNick, {
        password: authToken,
        debug: false,
        showErrors: true,
        channels: [userChannel],
        autoConnect: false,
        autoRejoin: true,
        retryCount: 10,
        retryDelay: 2000,
        stripColors: false,
        millisecondsOfSilenceBeforePingSent: 15 * 1000,
        millisecondsBeforePingTimeout: 8 * 1000,
    });

    ircClient.on('error', function(e){
        console.log(e);
    })

    ircClient.on(('message' + userChannel), function(nick, text, message) {
        console.log('Message ' + userChannel);
        console.log(nick);
        console.log(text);
        console.log(message);

    });

    ircClient.on(('message'), function (nick, to, text, message) {
        console.log('Message Event.');
        console.log(nick);
        console.log(text);
        console.log(message);

    });

    ircClient.on(('raw'), function (message) {
        console.log('Got Raw');
        console.log(message);

    });

    ircClient.connect(10, function(){
        console.log('Connected to IRC!');
    });

    ircClient.send('CAP REQ', 'twitch.tv/tags');
    //ircClient.send('CAP REQ', 'twitch.tv/commands');

    ircClient.join(userChannel, function () {
        console.log('Joined ' + userChannel);
        chatTalk('/color HotPink');
        chatAction('Hello everybody! Type !help to get some help with my commands.');
        callback();
    });
}

function gotChat(from, message, messageObject){
    console.log(messageObject);

    db.checkCommand(message, function (commandObject) {
        if (commandObject) {
            console.log('An Command Was Called');
            console.log(commandObject.response);
            var response = commandReplaceFrom(commandObject.response, from);
            chatTalk(response);
        }
    });
}

function gotWhisper(from, body) {
    db.checkCommand(body,function(commandObject){
        if(commandObject){
            console.log('An Command Was Called');
            console.log(commandObject.response);
            var response = commandReplaceFrom(commandObject.response, from);
            whisper(from, response);
        }
    });
}

function chatJoined() {
    
}

function gotFollow() {

}

function gotBits() {

}

function gotDonation() {

}

function gotSubscription() {

}

function chatTalk(message){
    ircClient.say(userChannel, message);
}

function chatAction(message){
    ircClient.action(userChannel, message);
}

function whisper(to, message){
    ircClient.say(userChannel, ("/w " + to + " " + message));
}

function commandReplaceFrom(response, from){
    var respond = response.replace("FROM", ("@" + from));
    return respond;
}