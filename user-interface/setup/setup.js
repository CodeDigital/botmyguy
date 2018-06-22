var $ = require("jquery");

const fs = require('fs');
const db = require('../../database/database.js');

const {
    shell,
    ipcRenderer
} = require('electron');

var isConnecting = false;

const welcomeContent = document.getElementById('welcomeLink');
var welcomeBody = welcomeContent.import.body;
welcomeBody.id = 'welcome';

const streamerContent = document.getElementById('streamerLink');
var streamerBody = streamerContent.import.body;
streamerBody.id = 'streamer';

// const botContent = document.getElementById('botLink');
// var botBody = botContent.import.body;
// botBody.id = 'bot';

// const streamlabsContent = document.getElementById('streamlabsLink');
// var streamlabsBody = streamlabsContent.import.body;
// streamlabsBody.id = 'streamlabs';

// const discordContent = document.getElementById('discordLink');
// var discordBody = discordContent.import.body;
// discordBody.id = 'discord';

const mainBody = document.getElementById('main');
mainBody.appendChild(welcomeBody);
mainBody.appendChild(streamerBody);
// mainBody.appendChild(botBody);
// mainBody.appendChild(streamlabsBody);
// mainBody.appendChild(discordBody);

changeTo('welcome');

document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, {});
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {});
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems, {});
});

function changeTo(type) {

    mainBody.childNodes.forEach(function (cNode) {
        cNode.className = 'hide';
    });

    var link = document.getElementById(type);
    link.className = '';


}

function openGithub() {
    shell.openExternal('https://github.com/CodeDigital/botmyguy');
}

