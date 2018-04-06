//Twitch Authentication Module. Gets user information and stuff.

//used for REST requests!
var request = require("request");
const clientID = 'yblspem7dabcfdv0nk918jaq8a70yb';

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

  console.log('nonce used: ' + nonce);
  return nonce;
}


//Gets both the idtoken and the accesstoken for the bot.
function getTokens() {
  var tokens = {};
  //Generate the Nonce.
  var nonce = generateNonce();

  //Create Auth Window.
  let twitch_token_window = new BrowserWindow({});
  twitch_token_window.loadURL('https://id.twitch.tv/oauth2/authorize?client_id=yblspem7dabcfdv0nk918jaq8a70yb&redirect_uri=http%3A%2F%2Flocalhost&response_type=token%20id_token&scope=openid%20user%3Aedit&nonce=' + nonce);

  //Check Window for new URL
  contents = twitch_token_window.webContents;
  contents.on('did-get-redirect-request', function(event,oldURL,newURL,isMainFrame,httpResponseCode,requestMethod,referrer,headers) {
    twitch_token_window.close();
    console.log(newURL);
    var accTokenStart = newURL.indexOf('#access_token=') + 14;
    var accTokenEnd = newURL.indexOf('&', accTokenStart);
    var accessToken = newURL.substring(accTokenStart,accTokenEnd);
    tokens.accessToken = accessToken;
    var idTokenStart = newURL.indexOf('&id_token=') + 10;
    var idTokenEnd = newURL.indexOf('&', idTokenStart);
    var idToken = newURL.substring(idTokenStart,idTokenEnd);
    tokens.idToken = idToken;

    return tokens;
  });
}

//generates the ID for the bot (to listen to whispers only)
function getBotID(token) {
  // TODO: Write getBotID.

}

//Generates the ID of a user given an oauth 2.0 token and... (to listen to bits, hosts, subscriptions and follows)
function getUserID(token) {
  // TODO: Write getUserID.

}

//Generates a random whole value between min and max, both inclusive.
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

module.exports.getTokens = getTokens;
module.exports.getBotID = getBotID;
module.exports.getBotID = getUserID;
