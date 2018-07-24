//App JS File meant to simplify main.js communication with electron!

//Declaration of Electron Things...
const {
  BrowserWindow,
  ipcMain
} = require('electron');
const url = require('url');
const path = require('path');
let mainWindow, errorWindow, loadWindow, updateWindow, setupWindow, commandWindow;

module.exports.mainWindow = function () {
  //Create The Main Window
  mainWindow = new BrowserWindow({
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    width: 1280,
    height: 720,
    show: false,
    minHeight: 450,
    minWidth: 800
  });

  //Load HTML File into window.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'home/home.html'),
    protocol: 'file:',
    slashes: true
  }));

  if (process.env.NODE_ENV != 'production') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('ready-to-show', function () {
    mainWindow.show();
  });

  mainWindow.eval = global.eval = function () {
    throw new Error(`Sorry, this app does not support window.eval().`)
  };

  return mainWindow;
};

module.exports.errorWindow = function (title, message) {
  var errorMessage = {};
  errorMessage.title = title;
  errorMessage.body = message;
  errorMessage.timer;

  //Create Error Window
  errorWindow = new BrowserWindow({
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    resizable: false,
    width: 400,
    height: 200,
    title: 'An Error Occured!'
  });

  //Load Error Window Template
  errorWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'error.html'),
    protocol: 'file:',
    slashes: true
  }));

  errorMessage.timer = setInterval(function () {
    //console.log('Shown');
    errorWindow.webContents.send('got:error', errorMessage);
  }, 10);


  //Garbage Collection Handle.
  errorWindow.on('closed', function () {
    errorWindow = null;
  });

  errorWindow.eval = global.eval = function () {
    throw new Error(`Sorry, this app does not support window.eval().`);
  };

  return errorWindow;
};

module.exports.loadingWindow = function () {
  //Create The Main Window
  loadWindow = new BrowserWindow({
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    resizable: false,
    width: 550,
    height: 550,
    show: false,
    title: 'Loading In!'
  });

  //Load HTML File into window.
  loadWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'loading.html'),
    protocol: 'file:',
    slashes: true
  }));

  if (process.env.NODE_ENV != 'production') {
    loadWindow.webContents.openDevTools();
  }

  loadWindow.on('ready-to-show', function () {
    loadWindow.show();
  });

  loadWindow.eval = global.eval = function () {
    throw new Error(`Sorry, this app does not support window.eval().`);
  };

  return loadWindow;

};

module.exports.updateWindow = function () {
  //Create The Main Window
  updateWindow = new BrowserWindow({
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    resizable: false,
    width: 550,
    height: 550,
    show: false,
    title: 'Updating!'
  });

  //Load HTML File into window.
  updateWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'updater.html'),
    protocol: 'file:',
    slashes: true
  }));

      //updateWindow.webContents.openDevTools();

  if (process.env.NODE_ENV != 'production') {
    updateWindow.webContents.openDevTools();
  }

  updateWindow.on('ready-to-show', function () {
    updateWindow.show();
  });

  updateWindow.eval = global.eval = function () {
    throw new Error(`Sorry, this app does not support window.eval().`);
  };

  return updateWindow;

};

module.exports.setup = function () {
  //Create The Main Window
  setupWindow = new BrowserWindow({
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    resizable: false,
    width: 800,
    height: 600,
    title: 'Welcome to Bot My Guy!'
  });

  //Load HTML File into window.
  setupWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'setup/setup.html'),
    // pathname: path.join(__dirname, 'h.html'),
    protocol: 'file:',
    slashes: true
  }));

  if (process.env.NODE_ENV != 'production') {
    setupWindow.webContents.openDevTools();
  }

  setupWindow.eval = global.eval = function () {
    throw new Error(`Sorry, this app does not support window.eval().`);
  };

  return setupWindow;

};

module.exports.editCommand = function () {
  //Create The Main Window
  commandWindow = new BrowserWindow({
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    resizable: false,
    show: false,
    width: 800,
    height: 600,
    title: 'Edit A Command!'
  });

  //Load HTML File into window.
  commandWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'home/commands/new-command.html'),
    protocol: 'file:',
    slashes: true
  }));

  commandWindow.on('ready-to-show', function () {
    commandWindow.show();
  });

  if (process.env.NODE_ENV != 'production') {
    commandWindow.webContents.openDevTools();
  }

  commandWindow.eval = global.eval = function () {
    throw new Error(`Sorry, this app does not support window.eval().`);
  };

  return commandWindow;

};