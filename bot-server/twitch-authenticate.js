//Twitch Authentication Module. Gets user information and stuff.

//Basic Declarations. jwt (for idtoken validation), Client ID (obvious) and... TODO: Finish the ID functions.
const jwt = require('jsonwebtoken');
const request = require('request');
//const { BrowserWindow } = require('electron');
const {remote, session} = require('electron');
console.log(remote);
const clientID = 'yblspem7dabcfdv0nk918jaq8a70yb';
let twitch_auth_window;

//Generates a nonce value (for security purposes).
function generateNonce() {
  var nonce = '';
  var possibleLetters = ['a','b','c','d','e','f','g','h','i','j','k','l','m',
  'n','o','p','q','r','s','t','u','v','w','x','y','z'];
  var next = '';
  //var nonceLength = getRandomIntInclusive(30,50);
  var nonceLength = 64;
  console.log('length - ' + nonceLength);

  for (var i = 0; i < nonceLength; i++) {
    var isNumber = (Math.random() >= 0.5);
    if(isNumber){
      next = getRandomIntInclusive(0,9);
    }else{
      var letterIndex = getRandomIntInclusive(0,25);
      var isCapital = (Math.random() >= 0.5);
      next = possibleLetters[letterIndex];
      if(isCapital){
        next = next.toUpperCase();
      }
    }
    nonce = nonce + '' + next;
  }

  return nonce;
}


//Gets both the idtoken and the accesstoken for the bot.
function getInfo(callback) {
    var token_Info = {};
    //Generate the Nonce.
    var nonce = generateNonce();
    let twitch_auth_window;

    //Create Auth Window.
    twitch_auth_window = new remote.BrowserWindow({
      titleBarStyle: 'customButtonsOnHover',
      frame: false,
      resizable: false,
      width: 500,
      height: 600,
      title: 'Welcome to Bot My Guy!'
    });
  twitch_auth_window.webContents.openDevTools()


  twitch_auth_window.webContents.session.clearStorageData(function() {
    console.log('Electron password auth cache cleared');

    twitch_auth_window.loadURL('https://id.twitch.tv/oauth2/authorize?' +
      'client_id=' + clientID +
      '&redirect_uri=' + 'http%3A%2F%2Flocalhos' +
      '&response_type=' + 'token%20id_token' +
      '&scope=openid%20user%3Aedit%20bits%3Aread%20user%3Aread%3Aemail' +
      '&nonce=' + nonce);
  });

    //Check Window for new URL
    contents = twitch_auth_window.webContents;
    contents.on('did-get-redirect-request', function (event, oldURL, newURL, isMainFrame, httpResponseCode, requestMethod, referrer, headers) {

      //Finds Access Token
      var accTokenStart = newURL.indexOf('#access_token=') + 14;
      var accTokenEnd = newURL.indexOf('&', accTokenStart);
      var accessToken = newURL.substring(accTokenStart, accTokenEnd);
      token_Info.accessToken = accessToken;

      //Finds ID Token
      var idTokenStart = newURL.indexOf('&id_token=') + 10;
      var idTokenEnd = newURL.indexOf('&', idTokenStart);
      var idToken = newURL.substring(idTokenStart, idTokenEnd);
      token_Info.idToken = idToken;

      //Decode the IDToken for security.
      var decoded = jwt.decode(idToken, { complete: true });

      //Compares Nonce and ISS to verify accesstoken.
      if (decoded.payload.nonce == nonce && decoded.payload.iss == 'https://id.twitch.tv/oauth2') {
        console.log('Nonce and Sender Valid! bot_Info Validated!');
        //twitch_auth_window.close();

        //Get the Bot's User ID.
        getTwitchID(token_Info.accessToken, function (e) {
          token_Info.user = e;
          console.log(token_Info);
          callback(token_Info);
        });
      } else {
        console.log('Wrong Auth Received :O');
      }
    });
}


//Generates the ID of a user given an oauth 2.0 token and... (to listen to bits, hosts, subscriptions and follows)
function getTwitchID(token, callback) {
  // TODO: Write getUserID.
  var options = {
    method: 'GET',
    url: 'https://api.twitch.tv/helix/users',
    headers: { authorization: ('Bearer ' + token) }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    //return body.data;
    var data = JSON.parse(body);
    console.log(data);
    callback(data.data);
  });

}

//Generates a random whole value between min and max, both inclusive.
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

module.exports.getInfo = getInfo;