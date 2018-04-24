const irc = require('irc');
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
            nonce = ta.generateNonce();
            console.log("botID - " + bot_id);
            startWS(callback);
        });
    });
};

module.exports.disconnect = function(){

};

function startIRC(callback){

    ircClient = new irc.Client('irc.chat.twitch.tv', botNick, {
        autoConnect: false,
        autoRejoin: true,
        channels: [userChannel],
        userName: botNick,
        retryCount: 10,
        retryDelay: 2000,
        debug: false,
        showErrors: false
    });

    ircClient.addListener('error', function(e) {
        //TODO: Add Error Window Thingy.

        console.log('Error: ' + e.prefix + " | " + e.nick + " | " + e.user + " | " + e.host + " | " + e.server + " | " + e.rawCommand + " | " + e.command + " | " + e.args);
    });

    ircClient.addListener('registered', function(message) {
        console.log("Registered !");
        console.log(message.args);
        console.log("------------------");
    });

    ircClient.addListener('message', function (from, message) {
        console.log('pm: ' + from + ' - ' + message);
    });

    ircClient.addListener(('message' + userChannel), function (from, text, messageObject) {
        gotChat(from, text, messageObject);
        console.log(from + ' => ' + userChannel + ': ');
        console.log(messageObject);
    });

    ircClient.addListener('motd', function (motd) {
        console.log(motd);
    });

    ircClient.addListener('ping', function (server) {
        console.log('You\'ve been pinged!');
    });

    ircClient.connect(10, function () {
        console.log('IRC Connected!');
    });

    ircClient.send('PASS', authToken);

    ircClient.join((userChannel), function () {
        console.log('Connected to ' + userChannel);
        chatTalk('/color hotpink');
        chatAction('Hello Everybody! I\'m here to help. Type !help for commands.');
        ircClient.send('CAP', 'REQ', ':twitch.tv/commands');
        chatTalk('/host ' + userChannel);
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