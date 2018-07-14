const irc = require('irc-upd');
const tmi = require('twitch-js');
const disp = require('../user-interface/display.js');

var db, ck;

if (process.env.NODE_ENV == "production") {
    db = require('../../app.asar.unpacked/database/database.js');
    ck = require('../../app.asar.unpacked/database/cookies.js');
} else {
    db = require('../database/database.js');
    ck = require('../database/cookies.js');
}
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

let client;
var ircSuccess = false;


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
            //startWS(callback);
            startIRC(callback);
        });
    });
};

module.exports.disconnect = function(callback){
    client.disconnect().then(function() {
        // ws.onclose(function () {
        callback(); 
        // });
        //ws.terminate();
    }).catch(function(err) {
        // TODO:  Add error window event.
    });

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

    client = new tmi.client(options);

    client.on('chat', function (channel, user, message, self) {
        if (user.mod) {
            
        }
        gotChat(user, message);
        console.log('Got an IRC Message!');

    });

    client.on('whisper', function (from, userstate, message, self) {
        // if(!self){
            gotWhisper(from, message);
        // }
    });

    client.on('connected', function(address, port){
        callback();
    });

    client.connect();
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
    console.log('got a whisper');
    db.checkCommand(body, function(commandObject){
        if(commandObject){
            commandObject.api.forEach(function(type) {
                if (type == 'twitchWhisper') {
                    console.log('An Command Was Called');
                    console.log(commandObject.response);
                    console.log(from);
                    var response = commandObject.response;
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
    client.say(userChannel, message);
}

function chatAction(message){
    client.action(userChannel, message);
}

function whisper(to, message){
    client.whisper(to, message).catch(function (err) {
        console.log(err);
    });
}

function commandReplaceFrom(response, from){
    var respond = response.replace("FROM", ("@" + from.toLowerCase()));
    return respond;
}