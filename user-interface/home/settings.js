const ipcSettingsRenderer = require('electron').ipcRenderer;

function relogin() {
    ipcSettingsRenderer.send('auth:restart');
}