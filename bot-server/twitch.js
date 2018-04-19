const irc = require('irc');
const websocket = require('ws');
const disp = require('../user-interface/display.js');
const db = require('../database/database.js');
const ck = require('../database/cookies.js');
const clientID = 'yblspem7dabcfdv0nk918jaq8a70yb';

var bot_id;
var user_id;
var token;
var authToken;

var heartbeat;
var userEnded = false;

let ws;
var whisperEvent;
var wsSuccess = false;
var wsRetryChecker;

let ircClient;
var ircSuccess = false;

const ping = {
    "type": "PING"
};
const pong = {
    "type": "PONG"
};

module.exports.connect = function(callback){

    ck.getCookie('twitchBotInfo', function (cookie) {
        db.getSettings(function(settings){
            bot_id = settings.bot_id;
            whisperEvent = "whispers." + bot_id;
            user_id = settings.streamer_id;
            token = cookie.accessToken;
            authToken = ("oauth:" + token);
            console.log("botID - " + bot_id);
            startWS(callback);
        });
    });
}

module.exports.disconnect = function(){

}

function startWS(callback){
    userEnded = false;
    wsSuccess = false;
    console.log("token - " + token);

    ws = new websocket('wss://pubsub-edge.twitch.tv');

    ws.addEventListener('open', function () {
        startPinging();
        confirmConnection('ws', callback);
        var whisperTopic = "whispers." + bot_id;
        ws.send(JSON.stringify({
            "type": "LISTEN",
            "data": {
                "topics": [("whispers." + bot_id)],
                "auth_token": token
            }
        }));
    });

    ws.addEventListener('close', function(code, reason){
        console.log('WS Closed Because: ' + reason + ' | Code: ' + code.data);
        clearTimeout(wsRetryChecker);

        if (!userEnded) {
            startWS(callback);
        } else {
            successfulConnection = false;
        }
    });

    ws.addEventListener('error', function (e) {
        console.log(e);
        clearInterval(heartbeat);
        clearTimeout(wsRetryChecker);
        startWS(callback);
    });

    ws.addEventListener('message', function (event) {
        console.log('Got a mesage - ');
        console.log(event);
        if (event != undefined) {
            if (event.data != undefined) {
                var edata = JSON.parse(event.data);
                if (edata.type == 'MESSAGE') {
                    if (edata.data != undefined) {
                        if (edata.data.topic = whisperEvent) {
                            var datas = JSON.parse(edata.data.message);
                            console.log('Got A Whisper!');
                            if (datas.data != undefined) {
                                var message = JSON.parse(datas.data);
                                var body = message.body;
                                var senderInfo = message.tags;
                                var sender = senderInfo.login;
                                gotWhisper(sender, body);
                            }
                        } else {
                            console.log('This is something else...')
                        }
                    }
                } else if (edata.type = 'RECONNECT') {
                    console.log('Reconnecting to WS. Reason - ');
                    console.log(edata);
                    clearInterval(heartbeat);
                    clearTimeout(wsRetryChecker);
                    startWS();
                }
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
    heartbeat = setInterval(function () {
        if (ws.readyState == 1 && !userEnded) {
            ws.ping(JSON.stringify(ping), true, function () {
                console.log('Pinged WS Server');
            });
        }
    }, (60 * 1000));
}

function confirmConnection(type, callback){
    wsRetryChecker = setTimeout(function () {
        console.log('Established Stable Connection To ' + type);
        callback;

        if(type == 'ws'){
            wsSuccess = true;
        }else{
            ircSuccess = true;
        }
    }, 5000);
}