const {app, BrowserWindow, Menu, ipcMain} = require('electron');
app.disableHardwareAcceleration();
const disp = require('./user-interface/display.js');
const twitchauth = require('./bot-server/twitch-authenticate.js');
const db = require('./database/database.js');

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

ipcMain.on('streamerauth:done', function(e, item) {

});

ipcMain.on('auth:connected', function(e, item) {
  settings.firstTime = false;
  settings.user = item.user;
  db.setSettings(settings);
  console.log('connected');
  //Create the mainwindow
  mainWindow = disp.mainWindow();

  //Quit Everything when Window Closed.
  mainWindow.on('closed',function() {
      app.quit();
  });
});
