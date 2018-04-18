const fs = require('fs');
const path = require('path');

module.exports.getSettingsSync = function() {
    //settings from JSON
    var settings;

    var settingBuffer = fs.readFileSync(path.join(__dirname, 'settings.json'));
    settings = JSON.parse(settingBuffer);

    return settings;
}

module.exports.getSettings = function (callback) {
    //settings from JSON
    let settings;

    var settingsBuffer;
    fs.readFile(path.join(__dirname, 'settings.json'), function(err, data){
        if (err) throw err;
        settingsBuffer = data;
        settings = JSON.parse(settingsBuffer);

        callback(settings);
    });
}

module.exports.setSettings = function(settings){
    var settingsBuffer = JSON.stringify(settings);
    fs.writeFileSync(path.join(__dirname, 'settings.json'), settingsBuffer);
    console.log(path.join(__dirname, 'settings.json'));
};

module.exports.newCommand = function (command, response, type, api) {
    fs.readFile(path.join(__dirname, 'commandsTemplate.json'), function(err, data){
        if (err) throw err;

        let newCommand = JSON.parse(data);
        newCommand.command = command;
        newCommand.response = response;
        newCommand.type = type;
        newCommand.api = api;

        fs.readFile(path.join(__dirname, 'commandsTemplate.json'), function(err, data){
            if (err) throw err;

            var commands = JSON.parse(data);
            let replaced = false;
            commands.forEach(function(commObj, commIndex){
                if(commObj.command == command || commObj.response == response || commObj.type == type || commObj.api == api){
                    commands[commIndex] = newCommand;
                    replaced = true;
                }
            });
            if(!replaced){
                commands.push(newCommand);
            }

            var commandsBuffer = JSON.stringify(commands);
            fs.writeFileSync(path.join(__dirname, 'commands.json'), commands);
        });
    });
};

module.exports.checkCommand = function (command, callback) {
    //commands from JSON
    let commands;

    var commandsBuffer;
    fs.readFile(path.join(__dirname, 'commands.json'), function (err, data) {
        if (err) throw err;

        commandsBuffer = data;
        commands = JSON.parse(commandsBuffer);
        var found = false;

        commands.forEach(function(command){
            if(commObj.command.includes(command)){
                found = true;
                callback(commObj);
            }
        });

        if(!found){
            callback(undefined);
        }
    });
}