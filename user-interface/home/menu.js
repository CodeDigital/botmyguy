var $ = require("jquery");

const fs = require('fs');
const db = require('../../database/database.js');

const {
  shell,
  ipcRenderer
} = require('electron');

var isConnecting = false;
const dashboardContent = document.getElementById('dashboardLink');
var dashboardBody = dashboardContent.import.body;
dashboardBody.id = 'dashboard';

const commandsContent = document.getElementById('commandsLink');
var commandsBody = commandsContent.import.body;
commandsBody.id = 'commands';

const mainBody = document.getElementById('main');
mainBody.appendChild(dashboardBody);
mainBody.appendChild(commandsBody);
//changeTo('commands');

document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('.collapsible');
  var instances = M.Collapsible.init(elems, {});
  var elems = document.querySelectorAll('.fixed-action-btn');
  var instances = M.FloatingActionButton.init(elems, {});
  var elems = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(elems, {});
});

function changeTo(type) {

  mainBody.childNodes.forEach(function(cNode){
    cNode.className = 'hide';
  });

  var link = document.getElementById(type);
  link.className = '';

  //$(".main").empty();
  //$(".main").html = content;
  //console.log($(".main"));
}

function openGithub() {
  shell.openExternal('https://github.com/CodeDigital/botmyguy');
}

db.getSettings(function (settings) {
  var userWelcome = document.getElementById('welcomeText');
  var wText = userWelcome.innerHTML;
  wText = wText.substring(0, 9) + settings.user;
  userWelcome.innerHTML = wText;
});

function connect() {
  if (!isConnecting) {
    var connectIcon = document.getElementById('connectIcon');
    var loadingCircle = document.getElementById('loadingCircle');

    loadingCircle.className = "preloader-wrapper small active left";
    connectIcon.style = "display:none;"
    ipcRenderer.send('connect');
    isConnecting = true;
  }
}

ipcRenderer.on('connect:success', function (e) {
  var connectButton = document.getElementById('cButton');
  var disconnectButton = document.getElementById('dcButton');

  connectButton.className = "btn btn-large green waves-effect right hide";
  disconnectButton.className = "btn btn-large red waves-effect right";
  isConnecting = false;
});

function disconnect() {
  ipcRenderer.send('disconnect');
}

ipcRenderer.on('disconnect:success', function (e) {
  var connectButton = document.getElementById('cButton');
  var disconnectButton = document.getElementById('dcButton');

  connectButton.className = "btn btn-large green waves-effect right";
  disconnectButton.className = "btn btn-large red waves-effect right hide";
});

// function includeHTML(divID) {
//   $(function () {
//     $("#content").load("test.html");
//   });
// }

// Initialize collapsible (uncomment the lines below if you use the dropdown variation)
// var collapsibleElem = document.querySelector('.collapsible');
// var collapsibleInstance = M.Collapsible.init(collapsibleElem, options);

// Or with jQuery

// $(document).ready(function () {
//   $('.sidenav').sidenav();
// });


// var activeElement = document.getElementById('active');
// activeElement.style.backgroundColor = '#190019';

// function menuHover(x) {
//   x.style.backgroundColor = '#100010';
//   x.style.borderColor = '#180018';
// }

// function menuNormal(x) {
//   x.style.borderColor = '#180018';
//   if(x == document.getElementById('active')){
//     x.style.backgroundColor = '#190019';
//   }else{
//     x.style.backgroundColor = '#210021';
//   }
// }