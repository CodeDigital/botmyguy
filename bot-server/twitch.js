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


    //TODO: Fix this!
module.exports.connect = function(callback){

    ck.getCookie('twitchBotInfo', function (cookie) {
        db.getSettings(function(settings){
            bot_id = settings.bot_id;
            whisperEvent = "whispers." + bot_id;
            user_id = settings.streamer_id;
            token = cookie.accessToken;
            authToken = ("oauth:" + token);
            nonce = ta.generateNonce();
            console.log("botID - " + bot_id);
            startWS(callback);
        });
    });
}

module.exports.disconnect = function(){

}

function startWS(callback){
    ws = new WebSocket('wss://pubsub-edge.twitch.tv');

    ws.on('open', function() {

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

        heartbeat = setInterval(function() {
            ws.send(JSON.stringify(ping));
        }, (60 * 1000));
    });

    ws.on('message', function(e) {
        if(e){
            var event = JSON.parse(e);
            console.log(event);
            if((event.nonce + "") == nonce){
                console.log('Message From TWITCH!');
            }
        }
    });
}

function startIRC(){
    
}

function gotChat(){

}

function gotWhisper(from, body) {
    console.log(from + " - " + body);
}

function gotFollow() {

}

function gotBits() {

}

function gotDonation() {

}

function gotSubscription() {

}

function startPinging() {

}