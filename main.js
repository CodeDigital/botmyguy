process.env.NODE_ENV = 'production';
//process.env.NODE_ENV = 'development';

const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require('electron');
const {autoUpdater} = require("electron-updater");

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
          var item;
          item.event = "error";
          item.error = err;
          updateWindow.webContents.send('updater:log', item);
          console.log('skipping update due to error');
          loadingWindow = disp.loadingWindow();

          loadingWindow.on('ready-to-show', function () {
            updateWindow.close();
          });

        });

        autoUpdater.on('checking-for-update', function () {
          console.log('Checking for an update');
          var item;
          item.event = "Checking for an update";
          updateWindow.webContents.send('updater:log', item);
        });

        autoUpdater.on('update-available', function () {
          console.log('There is an Update');
          var item;
          item.event = "There is an update";
          updateWindow.webContents.send('updater:log', item);
        });

        autoUpdater.on('update-not-available', function () {
          var item;
          item.event = "no updates available";
          updateWindow.webContents.send('updater:log', item);
          console.log('no updates are available');
          loadingWindow = disp.loadingWindow();

          loadingWindow.on('ready-to-show', function () {
            updateWindow.close();
          });
        });

        autoUpdater.on('download-progress', function (progress, bytesPerSecond, percent, total, transferred) {
          var item;
          item.event = "progress";
          item.progress = progress;
          item.bytesPerSecond = bytesPerSecond;
          item.percent = percent;
          item.total = total;
          item.transferred = transferred;
          updateWindow.webContents.send('updater:log', item);
        });

        autoUpdater.on('update-downloaded', function (response) {
          updateWindow.webContents.send('updater:log', 'update downloaded');
          setTimeout(function () {
            autoUpdater.quitAndInstall(true, true);

          }, 30000);
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

ipcMain.on('auth:restart', function (e) {
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