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

module.exports.connect = function(){

    ck.getCookie('twitchBotInfo', function (cookie) {
        db.getSettings(function(settings){
            var bot_id = settings.bot_id;
            var user_id = settings.streamer_id;
            var token = cookie.accessToken;
            var authToken = ("oauth:" + token);

            startWS();
        });
    });
}

module.exports.disconnect = function(){

}

function startWS(){
    userEnded = false;
    wsSuccess = false;

    ws = new websocket('wss://pubsub-edge.twitch.tv');

    ws.addEventListener('open', function () {
        startPinging();
        confirmConnection('ws');
    });

    ws.send(JSON.stringify({
        "type": "LISTEN",
        "data": {
            "topics": [("whispers." + bot_id)],
            "auth_token": token
        }
    }));

    ws.addEventListener('close', function(code, reason){
        console.log('WS Closed Because: ' + reason + ' | Code: ' + code.data);
        clearTimeout(wsRetryChecker);

        if (!userEnded) {
            startWS();
        } else {
            successfulConnection = false;
        }
    });

    ws.addEventListener('error', function (e) {
        console.log(e);
        clearInterval(heartbeat);
        clearTimeout(retryErrorOver);
        startWS();
    });

    ws.addEventListener('message', function (event) {
        if (event != undefined) {
            if (event.data != undefined) {
                var edata = JSON.parse(event.data);
                if (edata.type == 'MESSAGE') {
                    if (edata.data != undefined) {
                        if (edata.data.topic = whisperEvent) {
                            var datas = JSON.parse(edata.data.message);
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
                } else if (edata.type = 'RECONNECT' && wsSuccess) {
                    clearInterval(heartbeat);
                    clearTimeout(retryErrorOver);
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

function confirmConnection(type){
    wsRetryChecker = setTimeout(function () {
        console.log('Established Stable Connection To ' + type);
        if(type == 'ws'){
            wsSuccess = true;
        }else{
            ircSuccess = true;
        }
    }, 5000);
}