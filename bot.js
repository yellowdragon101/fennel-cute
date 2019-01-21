const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const fs = require('fs');
const dateFormat = require('dateFormat');
const JSON5 = require('json5');

readJson('auth.json', (err, auth) => {
    client.login(auth.token);
    if(err) return errorLogger(err);
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', message => {
    let username = message.author.username;
    if (message.content == "!fennel") {
        message.channel.send("cute");
        console.log(username + " knows fennel is cute");
    }
    if(message.content == "!3am") {
        message.channel.send("fennel fennel cutie fennel stab me with ur rapier");
        console.log(username + " wants fennel to stab them");
    }
    if(message.content == "!gachas" || message.content == "!gacha") {
        readJson("json.json", function(err, data) {
            if(err) return errLogger(err);
            data = currentEntries(data, "Gacha");
            data = data = data.map(entry => {
                return `${entry.title[0]}: ${entry.timers[0].start} - ${entry.timers[0].end}`
            });
            console.log(data);
            message.channel.send(data.join("\n") + "\n***All times JST** :flag_jp:");
        });
        console.log(username + " wants to know the current gachas");
    }
    if(message.content == "!events") {
        readJson("json.json", function(err, data) {
            if(err) return errLogger(err);
            data = currentEntries(data, "Event");
            data = data.map(entry => {
                return `${entry.title[0]}: ${entry.timers[0].start} - ${entry.timers[entry.timers.length-2].end}`
            });
            console.log(username + " wants to know the current event");
            message.channel.send(data.join("\n") + "\n***All times JST** :flag_jp:");
        });
    }
    if(message.content == "!maint" || message.content == "!maintenance") {
        readJson("json.json", function(err, data){
            if(err) return errLogger(err);
            data = currentEntries(data, "Maintenance");
            data = data.map(entry =>{
                return `${entry.title[0]}\n${entry.title[1]}: ${entry.timers[0].start} - ${entry.timers[0].end}`
            });
            console.log(username + " wants to know when the next maintenance is");
            if (data.length > 0) {
                message.channel.send(data.join("\n") + "\n***All times JST** :flag_jp:");
            }
            else message.channel.send("There are no scheduled maintenances.")
        });
    }
    if(message.content == "!eventshops" || message.content == "!shops") {
        readJson("json.json", function(err, data) {
            if(err) return errLogger(err);
            let events = currentEntries(data, "Event")
            let timers = [].concat.apply([], events.map(event => event.timers));
            timers = timers.filter(timer => timer.name.startsWith("Event Shop"));
            data = timers.map(entry => {
                return `${entry.name}: ${entry.start} - ${entry.end}`
            });
            console.log(username + " wants to know the current event shops")
            message.channel.send(data.join("\n") + "\n***All times JST** :flag_jp:");
        });
    }
    // todo
    // other (stone sales, login bonus, campaigns, )
    // alert when stuff happens
    // beautify
});

function readJson(filename, callback) {
    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) callback(err);
        callback(err, JSON.parse(data));
    });
}

function errLogger(err) {
    fs.appendFile("log.txt", `${dateFormat(new Date(), "m/d/yyyy HH:MM")}: ${err.message}\n${err.stack}\n`, function(err, result) {
        if(err) {
            console.log(err.message);
            message.channel.send("yellow is a dummy")
        }
    });
}

function currentEntries(entries, type) {
    entries = entries.filter(entry => entry.type == type)
    return entries.filter(entry => !isPast(dateConvert(entry.timers[0].end)))
}
function isPast(date) {
    return date < new Date();
}
function dateConvert(date) {
    let ret = new Date(date)
    console.log(ret);
    return ret;
}

const options = {
    url: 'https://icekirby.github.io/kirafan-timer/data.js',
    method: 'GET',
    headers: {
    }
};

update();
setInterval(update, 1000 * 60);

function update() {
    console.log("Updating data...");
    request(options, function(err, res, body) {
        convertedBody = body.substring("var timerData = ".length);
        convertedBody = convertedBody.substring(0, convertedBody.length - 3);
        convertedBody = JSON.stringify(JSON5.parse(convertedBody), null, 4);
        fs.writeFile("json.json", convertedBody, function(err, result) {
            if(err) return errorLogger(err);
        });
    });
}