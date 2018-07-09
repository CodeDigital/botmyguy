const {session} = require('electron');
const cookieLink = 'http://localhost';

module.exports.setCookie = function(cname, cvalue, callback){
    const cookie = { 
        url: cookieLink, 
        name: cname, 
        value: JSON.stringify(cvalue) 
    };

    session.defaultSession.cookies.set(cookie, function(error){
        if (error) throw error;

        callback(cookie);
    });
}

module.exports.getCookie = function(cname, callback){
    const filter = {
        name: cname
    };

    session.defaultSession.cookies.get(filter, function(error, cookies){
        if (error) throw error;

        callback(JSON.parse(cookies[0].value));
    });
};



