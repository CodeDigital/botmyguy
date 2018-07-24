process.env.NODE_ENV = 'production';
//process.env.NODE_ENV = 'development';

const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require('electron');
const {
  autoUpdater
} = require("electron-updater");

app.disableHardwareAcceleration();
const disp = require('./user-interface/display.js');
//const twitchauth = require('./bot-server/twitch-authenticate.js');
const tw = require('./bot-server/twitch.js');

var db, ck;

if (process.env.NODE_ENV == "production") {
  db = require('../app.asar.unpacked/database/database.js');
  ck = require('../app.asar.unpacked/database/cookies.js');
} else {
  db = require('./database/database.js');
  ck = require('./database/cookies.js');
}

var editingCommands = false;
var commandToEdit = null;

//Windows
let mainWindow;
let loadingWindow;
let setup;
let errorWindow;
let commandWindow;
let updateWindow; 

app.on('ready', function () {
  if (process.env.NODE_ENV == 'production') {

    db.getSettings(function (settings) {
      //if this is the first time, then just load, otherwise, setup process!
      if (settings.firstTime) {
        setup = disp.setup();
      } else {

        updateWindow = disp.updateWindow();

        autoUpdater.checkForUpdatesAndNotify();

        autoUpdater.on('error', function (err) {
          console.log('Error on line 39');
          console.log(err);
          updateWindow.webContents.send('updater:log', err);
          console.log('skipping update due to error');
          loadingWindow = disp.loadingWindow();

          loadingWindow.on('ready-to-show', function () {
            updateWindow.close();
          });

        });

        autoUpdater.on('checking-for-update', function () {
          console.log('Checking for an update');
          updateWindow.webContents.send('updater:log', 'checking for update.');
        });

        autoUpdater.on('update-available', function () {
          console.log('There is an Update');
          updateWindow.webContents.send('updater:log', 'There is an update');
        });

        autoUpdater.on('update-not-available', function () {
          updateWindow.webContents.send('updater:log', "no updates available");
          updateWindow.close();
          console.log('no updates are available');
          loadingWindow = disp.loadingWindow();

          loadingWindow.on('ready-to-show', function() {
            updateWindow.close();
          });
        });

        autoUpdater.on('update-downloaded', function (response) {
          updateWindow.webContents.send('updater:log', 'update downloaded');

          autoUpdater.quitAndInstall(true, true);
        });
      }
    });

  } else {
    db.getSettings(function (settings) {
      //if this is the first time, then just load, otherwise, setup process!
      if (settings.firstTime) {
        setup = disp.setup();
      } else {
        loadingWindow = disp.loadingWindow();
      }
    });
  }

});

app.on('window-all-closed', function () {
  app.quit();
});

ipcMain.on('auth:restart', function(e) {
  setup = disp.setup();
  mainWindow.hide();
});

ipcMain.on('streamerauth:done', function (e, item) {
  db.getSettings(function (sets) {
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
    settings.bot_nick = item.user.login;
    db.setSettings(settings);
    ck.setCookie('twitchBotInfo', item, function (cookie) {
      //console.log(cookie);

      ck.getCookie('twitchBotInfo', function (response) {
        console.log(response);
      });
    });
  });
});

ipcMain.on('setup:complete', function (e, item) {
  console.log('all is setup!');
  db.getSettings(function (sets) {

    var settings = sets;
    settings.firstTime = false;
    db.setSettings(settings);

    //Create the mainwindow
    mainWindow = disp.mainWindow();

    mainWindow.on('ready-to-show', function () {
      setup.close();
    });

    //Quit Everything when Window Closed.
    mainWindow.on('closed', function () {
      app.quit();
    });
  });
});

ipcMain.on('loading:complete', function (e, item) {
  console.log('all loaded in!');

  //Create the mainwindow
  mainWindow = disp.mainWindow();

  mainWindow.on('ready-to-show', function () {
    loadingWindow.close();
  });

  //Quit Everything when Window Closed.
  mainWindow.on('closed', function () {
    app.quit();
  });
});

ipcMain.on('connect', function (e, item) {
  tw.connect(function () {
    // botConnected = setInterval(function () {
    //   mainWindow.webContents.send("connect:success");
    // }, 10);
    mainWindow.webContents.send("connect:success");
  }, mainWindow);
});

ipcMain.on('disconnect', function (e, item) {
  tw.disconnect(function () {
    mainWindow.webContents.send("disconnect:success");
  });
});

ipcMain.on('newCommand:ready', function (e, item) {
  if (editingCommands) {

    commandWindow.webContents.send('commandedit:editing', commandToEdit);
    commandToEdit = null;
    editingCommands = false;

  }
});

ipcMain.on('commandedit:cancel', function (e, item) {
  commandWindow.close();
});

ipcMain.on('commandedit:edit', function (e, item) {
  db.newCommand(item);
  commandWindow.close();
  mainWindow.webContents.send('reload:command');
});

ipcMain.on('command:edit', function (e, item) {
  commandWindow = disp.editCommand();

  if (item) {

    editingCommands = true;
    commandToEdit = item;

  }
});
