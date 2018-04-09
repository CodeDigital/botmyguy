//App JS File meant to simplify main.js communication with electron!

//Declaration of Electron Things...
const {BrowserWindow, ipcMain} = require('electron');
const url = require('url');
const path = require('path');
let mainWindow;

module.exports.mainWindow = function() {
  //Create The Main Window
  mainWindow = new BrowserWindow({
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    width: 1280,
    height: 720
  });

  //Load HTML File into window.
  mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'home/dashboard.html'),
      protocol: 'file:',
      slashes: true
  }));

  return mainWindow;

}

module.exports.errorWindow = function(title, message) {
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
		errorWindow.on('closed', function(){
				errorWindow = null;
		});

    return errorWindow;
}
