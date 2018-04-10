const {app, BrowserWindow, Menu, ipcMain} = require('electron');
app.disableHardwareAcceleration();
const disp = require('./user-interface/display.js');
const fs = require('fs');

//settings from JSON
let settings;

//Windows
let mainWindow;
let loadingWindow;
let setup;
let errorWindow;

app.on('ready', function() {
  var settingBuffer = fs.readFileSync('database/settings.json');
  settings = JSON.parse(settingBuffer);

  //if this is the first time, then just load, otherwise, setup process!
  if(settings.firstTime){
    setup = disp.setup();

    //Quit Everything when Window Closed.
    setup.on('closed',function() {
        app.quit();
    });
  }else{
    loadingWindow = disp.loadingWindow();
  }

});

ipcMain.on('auth:connected', function(e, item) {
  settings.firstTime = false;
  settings.user = item.user;
  var settingsBuffer = JSON.stringify(settings);
  fs.writeFileSync('database/settings.json', settinsBuffer);
  console.log('connected');
  //Create the mainwindow
  mainWindow = disp.mainWindow();

  //Quit Everything when Window Closed.
  mainWindow.on('closed',function() {
      app.quit();
  });
});
