const {
    ipcRenderer
} = require('electron');
const db = require('../../../database/database.js');

var newCommand;

db.getCommandTemplate(function (commandTemplate) {
    newCommand = commandTemplate;
});

var twitchWhisperActive = false;
var twitchChatActive = false;
var discordActive = false;

function whenLoaded() {
    ipcRenderer.send("newCommand:ready");
}

function typeHover(x, type) {
    switch (type) {
        case "twitchChat":
            x.className = "btn btn-large grey lighten-4 grey-text text-darken-3 hoverable";
            var children = x.childNodes;
            console.log(children);
            var img = children[1];
            img.className = "left"
            break;

        case "twitchWhisper":
            x.className = "btn btn-large grey lighten-4 grey-text text-darken-3 hoverable";
            var children = x.childNodes;
            console.log(children);
            var img = children[1];
            img.className = "left"
            break;

        case "discord":
            x.className = "btn btn-large grey lighten-4 grey-text text-darken-3 hoverable";
            var children = x.childNodes;
            console.log(children);
            var img = children[1];
            img.className = "left"
            break;

        default:
            break;
    }
}

function typeMouseOff(x, type) {
    switch (type) {
        case "twitchChat":
            if (!twitchChatActive) {
                x.className = "btn btn-large grey hoverable darken-3";
                var children = x.childNodes;
                console.log(children);
                var img = children[1];
                img.className = "left hide"
            }
            break;

        case "twitchWhisper":
            if (!twitchWhisperActive) {
                x.className = "btn btn-large grey hoverable darken-3";
                var children = x.childNodes;
                console.log(children);
                var img = children[1];
                img.className = "left hide"
            }
            break;

        case "discord":
            if (!discordActive) {
                x.className = "btn btn-large grey hoverable darken-3";
                var children = x.childNodes;
                console.log(children);
                var img = children[1];
                img.className = "left hide"
            }
            break;

        default:
            break;
    }
}

function apiTypeClicked(type) {
    console.log('API Type CLICKED!');

    switch (type) {
        case "twitchChat":
            if (!twitchChatActive) {
                twitchChatActive = true;
            } else {
                twitchChatActive = false;
            }
            break;

        case "twitchWhisper":
            if (!twitchWhisperActive) {
                twitchWhisperActive = true;
            } else {
                twitchWhisperActive = false;
            }
            break;

        case "discord":
            if (!discordActive) {
                discordActive = true;
            } else {
                discordActive = false;
            }
            break;

    }
}

function cancel() {
    ipcRenderer.send('commandedit:cancel');
}

function addCommand() {
    var command = document.getElementById('chatCommand');
    var response = document.getElementById('chatResponse');
    var description = document.getElementById('chatDescription');
    console.log('Submitted');
    if (command.value != '' && response.value != '' && description.value != '' && (twitchChatActive || twitchWhisperActive || discordActive)) {
        var commandObject;
        console.log(command.value);
        db.getCommandTemplate(function (commandTemplate) {
            commandObject = commandTemplate;
            if (command.value[0] == "!") {
                commandObject.command = command.value;
            } else {
                commandObject.command = "!" + command.value;
            }
            commandObject.response = response.value;
            commandObject.description = description.value;
            var apis = commandObject.api;
            if (twitchChatActive) {
                apis.push("twitchChat");
            }
            if (twitchWhisperActive) {
                apis.push("twitchWhisper");
            }
            if (discordActive) {
                apis.push("discord");
            }
            console.log(apis);
            commandObject.api = apis;

            ipcRenderer.send('commandedit:edit', commandObject);
        });
    } else {
        var retryAlert = document.getElementById('retryAlert');
        retryAlert.className = "col s12 red z-depth-3";
    }
}

ipcRenderer.on('commandedit:editing', function (e, item) {
    var commandText = document.getElementById('chatCommand');
    var responseText = document.getElementById('chatResponse');
    var descriptionText = document.getElementById('chatDescription');
    var chatButton = document.getElementById('chatButton');
    var whisperButton = document.getElementById('whisperButton');
    var discordButton = document.getElementById('discordButton');

    console.log("received " + item);

    db.checkCommand(item, function (commandObject) {
        var itemCommand = commandObject.command;
        commandText.value = itemCommand.substring(1);
        responseText.value = commandObject.response;
        descriptionText.value = commandObject.description;
        var apiArray = commandObject.api;
        apiArray.forEach(apiType => {
            switch (apiType) {
                case 'twitchChat':
                    twitchChatActive = true;
                    chatButton.style.backgroundColor = "#533093";
                    break;

                case 'twitchWhisper':
                    twitchWhisperActive = true;
                    whisperButton.style.backgroundColor = "#533093";
                    break;

                case 'discord':
                    discordActive = true;
                    discordButton.style.backgroundColor = "1B1E22";
                    break;

                default:
                    break;
            }
        });

    });
});

whenLoaded();