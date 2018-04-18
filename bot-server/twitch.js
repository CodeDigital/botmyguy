const irc = require('irc');
const ws = require('ws');
const disp = require('../user-interface/display.js');
const db = require('../database/database.js');
let webSocket;
let ircClient;

const ping = {
    "type": "PING"
};
const pong = {
    "type": "PONG"
};

module.exports.connect = function(){
    
}

module.exports.disconnect = function(){

}

function startWS(){
    var successsfulConnection = false;

}

function gotChat(){

}

function gotFollow() {

}

function gotBits() {

}

function gotFollow() {

}

function gotFollow() {

}