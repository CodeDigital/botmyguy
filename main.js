const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const disp = require('./user-interface/display.js');
let mainWindow;

app.on('ready', function() {
  mainWindow = disp.mainWindow();

  //Quit Everything when Window Closed.
  mainWindow.on('closed',function() {
      app.quit();
  });
});
