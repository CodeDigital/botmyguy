const irc = require('irc-upd');
const tmi = require('twitch-js');
const WebSocket = require('ws');
const disp = require('../user-interface/display.js');
const db = require('../database/database.js');
const ck = require('../database/cookies.js');
//const ta = require('./twitch-authenticate.js');
const clientID = 'yblspem7dabcfdv0nk918jaq8a70yb';
const {ipcMain} = require('electron');
const te = require('./twitch-icons.js');

var bot_id;
var user_id;
var token;
var authToken;
var botNick;
var userNick;
var userChannel;
var nonce;

var mainWindow;

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

module.exports.connect = function(callback, mainw){

    mainWindow = mainw

    ck.getCookie('twitchBotInfo', function (cookie) {
        db.getSettings(function(settings){
            bot_id = settings.bot_id;
            whisperEvent = "whispers." + bot_id;
            user_id = settings.streamer_id;
            token = cookie.accessToken;
            authToken = ("oauth:" + token);
            botNick = settings.bot_nick;
            userNick = settings.user;
            userChannel = settings.user;
            userChannel = "#" + userChannel.toLowerCase();
            //userChannel = userChannel.toLowerCase();
            //nonce = ta.generateNonce();
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

    var options = {
        options: {
            debug: false
        },
        connection: {
            reconnect: true
        },
        identity: {
            username: botNick,
            password: authToken
        },
        channels: [userChannel]
    };

    ircClient = new tmi.client(options);

    ircClient.on('chat', function (channel, user, message, self) {
        if (user.mod) {
            
        }
        gotChat(user, message);
        console.log('Got an IRC Message!');

    });

    ircClient.on('connected', function(address, port){
        callback();
    });

    ircClient.connect();

    // ircClient = new irc.Client('irc://irc.chat.twitch.tv:6697', botNick, {
    //     password: authToken,
    //     debug: true,
    //     showErrors: false,
    //     channels: [userChannel],
    //     autoConnect: false,
    //     autoRejoin: true,
    //     retryCount: 10,
    //     retryDelay: 2000,
    //     stripColors: false,
    //     millisecondsOfSilenceBeforePingSent: 15 * 1000,
    //     millisecondsBeforePingTimeout: 8 * 1000,
    // });

    // ircClient.on('error', function(e){
    //     console.log(e);
    // })

    // ircClient.on(('message' + userChannel), function(nick, text, message) {
    //     console.log('Message ' + userChannel);
    //     console.log(nick);
    //     console.log(text);
    //     console.log(message);

    // });

    // ircClient.on(('message'), function (nick, to, text, message) {
    //     console.log('Message Event.');
    //     console.log(nick);
    //     console.log(text);
    //     console.log(message);

    // });

    // ircClient.on(('raw'), function (message) {
    //     console.log('Got Raw');
    //     console.log(message);

    //     var msgArguments = message.args;
    //     fullBody = msgArguments[0];

    //     if(fullBody.includes('PRIVMSG')){
    //         var userIndex = fullBody.indexOf(((userChannel) + ' :')) + ((userChannel) + ' :').length;
    //         var body = fullBody.substring(userIndex);
    //         var fullCommand = message.command;
    //         var colorStartIndex = fullCommand.indexOf('color=') + 'color='.length;
    //         var colorEndIndex = fullCommand.indexOf(';', colorStartIndex);
    //         var userColor = fullCommand.substring(colorStartIndex, colorEndIndex);
    //         var fromStartIndex = fullCommand.indexOf('display-name=') + 'display-name'.length;
    //         var fromEndIndex = fullCommand.indexOf(';');
    //         var from = fullCommand.substring(fromStartIndex,fromEndIndex);
    //         from = from.toLowerCase();
    //         console.log(userColor);
    //         console.log(from);

    //     }else if(fullBody.includes('RESPONSE')){
    //         callback();
    //     }

    // });

    // ircClient.connect(10, function(){
    //     console.log('Connected to IRC!');
    //     //callback();
    // });

    // //ircClient.send('CAP REQ', 'twitch.tv/tags');
    // //ircClient.send('CAP REQ', 'twitch.tv/commands');

    // ircClient.join(userChannel, function () {
    //     console.log('Joined ' + userChannel);
    //     chatTalk('/color HotPink');
    //     chatAction('Hello everybody! Type !help to get some help with my commands.');
    //     callback();
    // });
}

function gotChat(from, message){
    // var twitchemotes = require('twitchemotes');
    // var emotes = twitchemotes({
    //      /* options */
    //      'channels':['twitch', userNick]
    //      });
    // //console.log(messageObject);
    var data = {
        'user': {
            'colour': '',
            'displayName': ''
        },
        'time':'',
        'message':''
    };
    data.user.colour = from.color;
    console.log(from.badges);
    console.log(from['badges']);
    data.user.displayName = te.formatBadges(from['display-name'], from['badges']);
    var now = new Date();
    data.time = now.toDateString() + " - " + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
    data.message = te.formatEmotes(message, from.emotes);
    
    //data.message = emotes(message);

    mainWindow.webContents.send("dashboard:chat", data);

    db.checkCommand(message, function (commandObject) {
        if (commandObject) {

            commandObject.api.forEach( function (type) {
                if(type == 'twitchChat'){
                    console.log('An Command Was Called');
                    console.log(commandObject.response);
                    var response = commandReplaceFrom(commandObject.response, from.username);
                    chatTalk(response);
                }
            });
        }
    });
}

function gotWhisper(from, body) {
    db.checkCommand(body, function(commandObject){
        if(commandObject){
            commandObject.api.forEach(function(type) {
                if (type == 'twitchWhisper') {
                    console.log('An Command Was Called');
                    console.log(commandObject.response);
                    var response = commandReplaceFrom(commandObject.response, from);
                    whisper(from, response);
                }                
            });
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
    ircClient.whisper(to, message);
}

function commandReplaceFrom(response, from){
    var respond = response.replace("FROM", ("@" + from.toLowerCase()));
    return respond;
}