//App JS File meant to simplify main.js communication with electron!

//Declaration of Electron Things...
const {
  BrowserWindow,
  ipcMain
} = require('electron');
const url = require('url');
const path = require('path');
let mainWindow, errorWindow, loadWindow, setupWindow, commandWindow;

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

  if(process.env.NODE_ENV != 'production'){
  mainWindow.webContents.openDevTools();
  }

  mainWindow.on('ready-to-show', function () {
    mainWindow.show();
  });

  return mainWindow;
}

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

  return errorWindow;
}

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

  return loadWindow;

}

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

  return setupWindow;

}

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

  return commandWindow;

}