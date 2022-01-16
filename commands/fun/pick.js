// Trouble making decisions because your brain can't grasp a simple understanding? Ask the bot to pick one of 2+ choices for you.

const { errorMsg } = require('../../configs/clientSettings.json');

const responses = [
    "Sometimes the simplest of answers are:",
    "The best option is clearly:",
    "It has been decided:",
    "'Twas a no brainer:",
    "The answer is:",
    "I choose..."
]

const cmdName = "pick";
const aliases = ["choosr"];

const description = "Trouble making decisions because your brain can't grasp a simple understanding? Ask the bot to pick one of 2+ choices for you.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        let args = commandData.splitContent(",").replace(",", "");
        
        if (args.length < 1) return message.channel.send("What the heck am I supposed to choose if you didn't give me any options??");
        if (args.length < 2)
            if (Math.floor(Math.random()*3) === 1)
                return message.channel.send("Are you really that indecisive that you couldn't pick between a single option?\n\nSeperate your options using a comma (\`,\`)");
            else
                return message.channel.send("Are you really that indecisive that you couldn't pick between a single option?");

        let choice = args[Math.floor(Math.random()*args.length)];
        let response = responses[Math.floor(Math.random()*responses.length)];

        if (choice)
            message.delete().then(() => { message.channel.send(`${response} ${choice}`); });
        else
            message.channel.send(errorMsg.COMMANDFAILEDMISERABLY);
    }
}