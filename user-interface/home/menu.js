var $ = require("jquery");

document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('.collapsible');
  var instances = M.Collapsible.init(elems, {});
  var elems = document.querySelectorAll('.fixed-action-btn');
  var instances = M.FloatingActionButton.init(elems, {});
  var elems = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(elems, {});
});

function changeTo(type){

  var link;
  var content;
  var body = document.getElementById('main');

  switch (type) {
    case 'dashboard':
        link = document.getElementById('dashboard');
      break;
  
    default:
      break;
  }

  content = link.import;
  content = content.body;
  console.log(content);
  body.appendChild(content);

  //$(".main").empty();
  console.log($(".main"));
  //$(".main").html = content;
  console.log($(".main"));
}

const { shell } = require('electron');

function openGithub() {
  shell.openExternal('https://github.com/CodeDigital/botmyguy');
}

var isConnecting = false;

const {ipcRenderer} = require('electron');
const fs = require('fs');
const db = require('../../database/database.js');

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


function commandEdit(x) {
  console.log("Edit button");
  console.log(x);
  ipcRenderer.send('command:edit', x);
}

function commandAdd() {
  console.log("Add button");
  ipcRenderer.send('command:edit', undefined);
}

function commandRemove(x) {
  console.log("remove Button");
  console.log(x);
  db.removeCommand(x, function (success) {
    if (success) {
      location.reload();
    }
  });
}

reloadCommands();

function reloadCommands() {
  db.getCommands(function (commands) {
    var btnList = document.getElementById('commandList');
    if(btnList){
      commands.forEach(function (commObj) {

        var newCommand = document.createElement('LI');
        newCommand.className = 'collection-item avatar pink darken-3';
        
        var iconDiv = document.createElement('DIV');
        iconDiv.style.marginLeft = '150px';
        iconDiv.style.marginTop = '10px';

        var title = document.createElement('SPAN');
        title.style.marginTop = '10px';
        title.style.display = 'block';

        var boldedTitle = document.createElement('B');
        boldedTitle.innerText = commObj.command;

        var description = document.createElement('P');
        description.style.textAlign = 'justify';
        description.innerText = commObj.description;

      });
    }
  });
}

  ipcRenderer.on("reload:command", function (e) {
    console.log('test');
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
