const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const fs = require('fs');
const dateFormat = require('dateformat');
const JSON5 = require('json5');
const schedule = require('node-schedule');
const channel = client.channels.get["533492822502801408"];
readJson('auth.json', (err, auth) => {
    client.login(auth.token);
    if(err) return errorLogger(err);
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setPresence({
        game: { 
            name: "kirara fantasia",
            type: 'PLAYING'
        },
    });
});

class Commands {
    constructor() {
        this.commands = {}
    }
    add(command, aliases, handler) {
        this.commands[command] = handler;
        for (let alias of aliases) {
            this.commands[alias] = handler;
        }
    }
    exists(command) {
        return command in this.commands;
    }
    execute(command, message) {
        this.commands[command](message);
    }
}

const commands = new Commands();

commands.add("3am", [], function(message) {
    message.channel.send("fennel fennel cutie fennel stab me with ur rapier");
    console.log(message.author.username + " wants fennel to stab them");
});

commands.add("fennel", [], function(message) {
    message.channel.send("cute");
    console.log(message.author.username + " knows fennel is cute");
});

commands.add("gacha", ["gachas"], function(message) {
    readJson("json.json", function(err, data) {
        if(err) return errLogger(err);
        data = currentEntries(data, "Gacha");
        data = data = data.map(entry => {
            return `${entry.title[0]}: ${entry.timers[0].start} - ${entry.timers[0].end}`
        });
        console.log(data);
        if (data.length > 0) {
            message.channel.send(data.join("\n") + "\n***All times JST** :flag_jp:");
        }
        else message.channel.send("There are no scheduled gachas.")
    });
    console.log(message.author.username + " wants to know the current gachas");
});

commands.add("events", [], function(message) {
    readJson("json.json", function(err, data) {
        if(err) return errLogger(err);
        data = currentEntries(data, "Event");
        data = data.map(entry => {
            return `${entry.title[0]}: ${entry.timers[0].start} - ${entry.timers[entry.timers.length-2].end}`
        });
        console.log(message.author.username + " wants to know the current event");
        if (data.length > 0) {
            message.channel.send(data.join("\n") + "\n***All times JST** :flag_jp:");
        }
        else message.channel.send("There are no scheduled events.")
    });
});

commands.add("maintenance", ["maint"], function(message) {
    readJson("json.json", function(err, data){
        if(err) return errLogger(err);
        data = currentEntries(data, "Maintenance");
        data = data.map(entry =>{
            return `${entry.title[0]}\n${entry.title[1]}: ${entry.timers[0].start} - ${entry.timers[0].end}`
        });
        console.log(message.author.username + " wants to know when the next maintenance is");
        if (data.length > 0) {
            message.channel.send(data.join("\n") + "\n***All times JST** :flag_jp:");
        }
        else message.channel.send("There are no scheduled maintenances.")
    });
});

commands.add("eventshops", ["shops"], function(message) {
    readJson("json.json", function(err, data) {
        if(err) return errLogger(err);
        let events = currentEntries(data, "Event")
        let timers = [].concat.apply([], events.map(event => event.timers));
        timers = timers.filter(timer => timer.name.startsWith("Event Shop"));
        data = timers.map(entry => {
            return `${entry.name}: ${entry.start} - ${entry.end}`
        });
        console.log(message.author.username + " wants to know the current event shops")
        if (data.length > 0) {
            message.channel.send(data.join("\n") + "\n***All times JST** :flag_jp:");
        }
        else message.channel.send("There are no current event shops.")
    });
});

commands.add("sales", ["sale"], function(message) {
    readJson("json.json", function(err, data) {
        if(err) return errLogger(err);
        data = currentEntries(data, "Other");
        data = data.filter(entry => entry.title[0].endsWith("Sale"))
        data = data.map(entry =>{
            return `- ${entry.title[0]}, ${entry.title[2]}:\n${entry.timers[0].start} - ${entry.timers[0].end}`
        });
        console.log(message.author.username + " wants to know the current sales");
        if (data.length > 0) {
            message.channel.send(data.join("\n") + "\n***All times JST** :flag_jp:");
        }
        else message.channel.send("There are no scheduled sales.")
    });
});

commands.add("loginbonus", [], function(message) {
    readJson("json.json", function(err, data) {
        if(err) return errLogger(err);
        data = currentEntries(data, "Other");
        data = data.filter(entry => entry.title[0].endsWith("Login Bonus"));
        data = data.map(entry => {
            return `- ${entry.title[0]}, ${entry.title[2]}:\n${entry.timers[0].start} - ${entry.timers[0].end}`
        });
        console.log(message.author.username + " wants to know the current login bonuses");
        if (data.length > 0) {
            message.channel.send(data.join("\n") + "\n***All times JST** :flag_jp:");
        }
        else message.channel.send("There are no scheduled login bonuses.")
    });
});

commands.add("campaigns", ["campaign"], function(message) {
    readJson("json.json", function(err, data) {
        if(err) return errLogger(err);
        data = currentEntries(data, "Other");
        data = data.filter(entry => entry.title[0].endsWith("Campaign"));
        data = data.map(entry =>{
            return `- ${entry.title[0]}, ${entry.title[2]}:\n${entry.timers[0].start} - ${entry.timers[0].end}`
        });
        console.log(message.author.username + " wants to know the current campaigns");
        if (data.length > 0) {
            message.channel.send(data.join("\n") + "\n***All times JST** :flag_jp:");
        }
        else message.channel.send("There are no scheduled campaigns.")
    });
});

client.on('message', message => {
    if (message.content.startsWith("!")) {
        let command = message.content.substring(1);
        if(commands.exists(command)) commands.execute(command, message);
    }
    //todo
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
    entries = entries.filter(entry => entry.type == type);
    return entries.filter(entry => !isPast(dateConvert(entry.timers[0].end)));
}
function isPast(date) {
    return date < new Date();
}
function dateConvert(date) {
    return new Date(date);
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