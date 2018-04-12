const fs = require('fs');

module.exports.getSettingsSync = function() {
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
    fs.readFile('database/settings.json', function(err, data){
        if (err) throw err;
        settingsBuffer = data;
        settings = JSON.parse(settingsBuffer);

        callback(settings);
    });
}

module.exports.setSettings = function(settings){
    var settingsBuffer = JSON.stringify(settings);
    fs.writeFileSync('database/settings.json', settinsBuffer);
};