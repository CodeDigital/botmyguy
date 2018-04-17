const {app, BrowserWindow, Menu, ipcMain} = require('electron');
app.disableHardwareAcceleration();
const disp = require('./user-interface/display.js');
const twitchauth = require('./bot-server/twitch-authenticate.js');
const db = require('./database/database.js');
const ck = require('./database/cookies.js');

//Windows
let mainWindow;
let loadingWindow;
let setup;
let errorWindow;

app.on('ready', function() {
  db.getSettings(function(settings){
    //if this is the first time, then just load, otherwise, setup process!
    if (settings.firstTime) {
      setup = disp.setup();

      //Quit Everything when Window Closed.
      setup.on('closed', function () {
        app.quit();
      });
    } else {
      loadingWindow = disp.loadingWindow();
    }
  });
});

ipcMain.on('streamerauth:done', function (e, item) {
  db.getSettings(function(sets){
    var settings = sets;
    settings.streamer_id = item.user.id;
    settings.user = item.user.display_name;
    db.setSettings(settings);
  });
});

ipcMain.on('botauth:done', function (e, item) {
  db.getSettings(function (sets) {
    var settings = sets;
    settings.bot_id = item.user.id;
    db.setSettings(settings);
    ck.setCookie('twitchBotInfo', item, function(cookie){
      //console.log(cookie);

      ck.getCookie('twitchBotInfo', function(response){
        console.log(response);
      });
    });
  });
});

ipcMain.on('setup:complete', function (e, item) {
  console.log('connected');
  //Create the mainwindow
  mainWindow = disp.mainWindow();

  //Quit Everything when Window Closed.
  mainWindow.on('closed', function () {
    app.quit();
  });
});
