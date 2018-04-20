const fs = require('fs');

module.exports.getSettingsSync = function () {
    //settings from JSON
    var settings;

    var settingBuffer = fs.readFileSync('database/settings.json');
    settings = JSON.parse(settingBuffer);

    return settings;
}

module.exports.getSettings = function (callback) {
    //settings from JSON
    let settings;

    var settingsBuffer;
    fs.readFile('database/settings.json', function (err, data) {
        if (data) {
            settingsBuffer = data;
            settings = JSON.parse(settingsBuffer);

            callback(settings);
        } else {
            fs.readFile('database/defaultSettings.json', function(err, data){
                if (err){

                }else{
                    var createStream = fs.createWriteStream("database/settings.json");
                    createStream.end();

                    settingsBuffer = data;
                    var newSettings = JSON.parse(settingsBuffer);
                    setSettings(newSettings);

                    callback(newSettings);
                }
            });
        }
    });
}

function setSettings(settings) {
    var settingsBuffer = JSON.stringify(settings);

    if (fs.existsSync('database.settings.json')){
        fs.writeFileSync('database/settings.json', settingsBuffer);
    } else {
        fs.readFile('database/defaultSettings.json', function (err, data) {
            if (err) {

            } else {
                var createStream = fs.createWriteStream("database/settings.json");
                createStream.end();

                fs.writeFileSync('database/settings.json', settingsBuffer);
            }
        });
    }
};

module.exports.setSettings = setSettings;

module.exports.newCommand = function (command, response, type, api) {
    fs.readFile('database/commandsTemplate.json', function (err, data) {
        if (err) throw err;

        let newCommand = JSON.parse(data);
        newCommand.command = command;
        newCommand.response = response;
        newCommand.type = type;
        newCommand.api = api;

        fs.readFile('database/commandsTemplate.json', function (err, data) {
            if (err) throw err;

            var commands = JSON.parse(data);
            let replaced = false;
            commands.forEach(function (commObj, commIndex) {
                if (commObj.command == command || commObj.response == response || commObj.type == type || commObj.api == api) {
                    commands[commIndex] = newCommand;
                    replaced = true;
                }
            });
            if (!replaced) {
                commands.push(newCommand);
            }

            var commandsBuffer = JSON.stringify(commands);
            fs.writeFileSync('database/commands.json', commands);
        });
    });
};

module.exports.checkCommand = function (command, callback) {
    //commands from JSON
    let commands;

    var commandsBuffer;
    fs.readFile('database/commands.json', function (err, data) {
        if (err) throw err;

        commandsBuffer = data;
        commands = JSON.parse(commandsBuffer);
        var found = false;

        commands.forEach(function (commObj) {
            if (command.includes(commObj.command)) {
                found = true;
                callback(commObj);
            }
        });

        if (!found) {
            callback(undefined);
        }
    });
}

module.exports.getCommands = function (callback) {
    //commands from JSON
    let commands;

    var commandsBuffer;
    fs.readFile('database/commands.json', function (err, data) {
        commandsBuffer = data;
        commands = JSON.parse(commandsBuffer);

        callback(commands);
    });
}