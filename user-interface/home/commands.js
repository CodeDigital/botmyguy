const dbCommands = require('../../database/database.js');

const ipcCommandsRenderer = require('electron').ipcRenderer;

//var $ = require("jquery");
//var btnList = $('#commandList');
var btnList = document.getElementById('commandList');
console.log(btnList);

function commandEdit(x) {
    console.log("Edit button");
    console.log(x);
    ipcCommandsRenderer.send('command:edit', x);
}

function commandAdd() {
    console.log("Add button");
    ipcCommandsRenderer.send('command:edit', undefined);
}

function commandRemove(x) {
    console.log("remove Button");
    console.log(x);
    dbCommands.removeCommand(x, function (success) {
        if (success) {
            //location.reload();
            reloadCommands();
        }
    });
}

function reloadCommands() {
    console.log('reloading commands');
    var btnList = document.getElementById('commandList');
    btnList.innerHTML = '';
    //console.log(btnList);
    dbCommands.getCommands(function (commands) {
        commands.forEach(function (commObj) {
            //console.log(commObj);
            var newCommand = document.createElement('LI');
            newCommand.className = 'collection-item avatar pink darken-3';

            var title = document.createElement('SPAN');
            title.style.marginTop = '10px';
            title.style.display = 'block';
            title.className = 'title';

            var boldedTitle = document.createElement('B');
            boldedTitle.innerText = commObj.command;

            title.appendChild(boldedTitle);
            newCommand.appendChild(title);

            var description = document.createElement('P');
            description.style.textAlign = 'justify';
            description.style.marginLeft = '-50px';
            description.innerText = commObj.description;
            newCommand.appendChild(description);

            var rightDiv = document.createElement('DIV');
            rightDiv.className = 'secondary-content white-text right';

            var iconDiv = document.createElement('DIV');
            iconDiv.style.marginRight = '15px';
            iconDiv.className = 'left';

            var apiType = commObj.api;

            apiType.forEach(function (api) {
                var addApiIcon = false;
                var img = document.createElement('IMG');
                img.className = 'btn btn-large btn-floating grey darken-4';
                img.style.padding = '0px';
                img.style.margin = '0 5px';
                switch (api) {
                    case 'twitchChat':
                        img.setAttribute('src', '../../assets/icons/twitchChat.svg');
                        addApiIcon = true;
                        break;

                    case 'twitchWhisper':
                        img.setAttribute('src', '../../assets/icons/twitchWhisper.svg');
                        addApiIcon = true;
                        break;

                    case 'discord':
                        img.setAttribute('src', '../../assets/icons/discordChat.svg');
                        addApiIcon = true;
                        break;

                    default:
                        break;
                }
                if (addApiIcon) {
                    iconDiv.appendChild(img);
                }
            });

            rightDiv.appendChild(iconDiv);

            var editCommandButton = document.createElement('BUTTON');
            editCommandButton.className = 'btn-large _btn-floating hoverable waves-effect blue';
            editCommandButton.style.margin = "0px 10px";
            editCommandButton.onclick = function(){
                commandEdit(commObj.command)
            };

            var editCommandIcon = document.createElement('I');
            editCommandIcon.className = 'material-icons large';
            editCommandIcon.innerText = 'edit';

            editCommandButton.appendChild(editCommandIcon);

            var removeCommandButton = document.createElement('BUTTON');
            removeCommandButton.className = 'btn-large _btn-floating hoverable waves-effect red';
            removeCommandButton.style.margin = "0px 10px";
            removeCommandButton.onclick = function() {
                commandRemove(commObj.command);
            }

            var removeCommandIcon = document.createElement('I');
            removeCommandIcon.className = 'material-icons large';
            removeCommandIcon.innerText = 'delete';

            removeCommandButton.appendChild(removeCommandIcon);

            rightDiv.appendChild(editCommandButton);
            rightDiv.appendChild(removeCommandButton);

            newCommand.appendChild(rightDiv);

            btnList.appendChild(newCommand);
            //btnList.append(newCommand);

        });


        btnList.appendChild(document.createElement('BR'));
        //btnList.append(document.createElement('BR'));


        var addCommandButton = document.createElement('LI');
        addCommandButton.className = 'container center-align';


        var addButton = document.createElement('BUTTON');
        addButton.className = 'btn btn-large green center-align hoverable waves-effect';
        addButton.style.width = '500px';
        addButton.style.height = '100px';
        addButton.style.padding = '0px 90px';

        var addDiv = document.createElement('DIV');
        addDiv.style.fontSize = '30px';

        var addIcon = document.createElement('I');
        addIcon.className = 'large material-icons left';
        addIcon.style.fontSize = '50px';
        addIcon.innerText = 'add_circle_outline';

        addDiv.appendChild(addIcon);
        addDiv.innerHTML = addDiv.innerHTML + "Add Command";

        addButton.appendChild(addDiv);
        addButton.onclick = function() {
            commandAdd();
        }

        addCommandButton.appendChild(addButton);

        btnList.appendChild(addCommandButton);
        btnList.appendChild(document.createElement('BR'));
        //btnList.append(addCommandButton);


    });
}

// setInterval(function(){
// reloadCommands();
// }, 2000);
//reloadCommands();
setTimeout(function () {
    reloadCommands();    
}, 10000);

ipcCommandsRenderer.on("reload:command", function (e) {
    console.log('test');
    setTimeout(function(){
        reloadCommands();
    }, 1000);
    //reloadCommands();
});