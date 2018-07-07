const https = require('https');

module.exports.formatEmotes = function(text, emotes) {
    var splitText = text.split('');
    for (var i in emotes) {
        var e = emotes[i];
        for (var j in e) {
            var mote = e[j];
            if (typeof mote == 'string') {
                mote = mote.split('-');
                mote = [parseInt(mote[0]), parseInt(mote[1])];
                var length = mote[1] - mote[0],
                    empty = Array.apply(null, new Array(length + 1)).map(function () {
                        return '';
                    });
                splitText = splitText
                    .slice(0, mote[0])
                    .concat(empty)
                    .concat(splitText.slice(mote[1] + 1, splitText.length));
                splitText.splice(
                    mote[0],
                    1,
                    '<img style="height:1.5rem;" src="http://static-cdn.jtvnw.net/emoticons/v1/' +
                    i +
                    '/3.0">'
                );
            }
        }
    }
    return splitText.join('');
}

//TODO: Fix badge parsing with > https://badges.twitch.tv/v1/badges/global/display?language=en and https://badges.twitch.tv/v1/badges/channels/+ CHANNEL_ID +/display?language=en
// Hint: convert to local JSON and work from there.

module.exports.formatBadges = function(text, badges){
    text = ' ' + text;

    if(badges['premium']){
        text = '<img style="height:1.2rem;" src="https://static-cdn.jtvnw.net/badges/v1/a1dd5073-19c3-4911-8cb4-c464a7bc1510/3">' + text;
    }
    
    if(badges['subscriber']){
        text = '<img style="height:1.2rem;" src="https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3">' + text;
    }

    if(badges['moderator']){
        text = '<img style="height:1.2rem;" src="https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3">' + text;
    }

    if(badges['global_mod']){
        text = '<img style="height:1.2rem;" src="https://static-cdn.jtvnw.net/badges/v1/9384c43e-4ce7-4e94-b2a1-b93656896eba/3">' + text;
    }

    if(badges['twitchbot']){
        text = '<img style="height:1.2rem;" src="https://static-cdn.jtvnw.net/badges/v1/df9095f6-a8a0-4cc2-bb33-d908c0adffb8/3">' + text;
    }

    if(badges['turbo']){
        text = '<img style="height:1.2rem;" src="https://static-cdn.jtvnw.net/badges/v1/bd444ec6-8f34-4bf9-91f4-af1e3428d80f/3">' + text;
    }

    if(badges['broadcaster']){
        text = '<img style="height:1.2rem;" src="https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/3">' + text;
    }

    if(badges['admin']){
        text = '<img style="height:1.2rem;" src="https://static-cdn.jtvnw.net/badges/v1/9ef7e029-4cdf-4d4d-a0d5-e2b3fb2583fe/3">' + text;
    }

    if(badges['staff']){
        text = '<img style="height:1.2rem;" src="https://static-cdn.jtvnw.net/badges/v1/d97c37bd-a6f5-4c38-8f57-4e4bef88af34/3">' + text;
    }
    return text;
}