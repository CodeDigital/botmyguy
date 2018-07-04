const ipcDashboardRenderer = require('electron').ipcRenderer;
//const dashboardShowdown = require('showdown');

// const {
//     EmoteFetcher,
//     EmoteParser
// } = require('twitch-emoticons');

// const fetcher = new EmoteFetcher();
// const parser = new EmoteParser(fetcher, {
//     type: 'html',
//     match: /(.+?)/g
// });

//var chatList = document.getElementById('chatList');

ipcDashboardRenderer.on('dashboard:chat', function (e, data) {
    var chatList = document.getElementById('chatList');

    console.log('got chat ' + data);
    
    var newChat = document.createElement('LI');
    newChat.className = 'collection-item pink darken-3';

    var uNameSpan = document.createElement('SPAN');
    uNameSpan.className = 'title left';
    uNameSpan.style.marginTop = '10px';
    uNameSpan.style.display = 'block';

    var uName = document.createElement('B');
    uName.style.color = data.user.colour;
    uName.innerText = data.user.displayName;

    uNameSpan.appendChild(uName);
    newChat.appendChild(uNameSpan);

    var timeSent = document.createElement('I');
    timeSent.className = 'secondary-content white-text right';
    timeSent.innerText = data.time;

    newChat.appendChild(timeSent);
    newChat.appendChild(document.createElement('BR'));

    var chatMessage = document.createElement('P');
    chatMessage.style.textAlign = 'justify';
    chatMessage.innerHTML = (data.message);

    newChat.appendChild(chatMessage);
    chatList.appendChild(newChat);
});