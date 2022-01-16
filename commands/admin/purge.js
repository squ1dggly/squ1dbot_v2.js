// Deletes a specified amount of messages within a channel.

const { timeouts } = require('../../configs/clientSettings.json');

const cmdName = "purge";
const aliases = ["clear"];

const description = "Deletes a specified amount of messages within a channel.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        let amount = commandData.args[0];

        switch (commandData.commandUsed) {
            case "purge":
                if (amount === "0") return message.reply("You're supposed to tell me how many I'm supposed to purge. Not your IQ.");
                if (isNaN(amount)) return message.reply("You forgot to tell me how many I'm supposed to purge, dumbass."); 

                PurgeMessages(message.channel, parseInt(amount), "p");

            case "clear":
                if (amount === "0") return message.reply("You're supposed to tell me how many I'm supposed to clear. Not your IQ.");
                if (isNaN(amount)) return message.reply("You forgot to tell me how many I'm supposed to clear, dumbass.");

                PurgeMessages(message.channel, parseInt(amount), "c");
        }

        amount = parseInt(amount);
        message.channel.bulkDelete(amount);
        
        let response = (amount > 1) ? `Deleted \`${amount}\` messages.` : "Deleted \`1\` message.";

        message.channel.send(response)
            .then(msg => setTimeout(() => msg.delete(), timeouts.warningMessage.ALERT));
    }
}

async function PurgeMessages(channel, amount, keyword) {
    let response;

    switch (keyword) {
        case "p":
            response = (amount > 1) ? `Purged \`${amount}\` messages.` : "Purged \`1\` message.";
        case "c":
            response = (amount > 1) ? `Cleared \`${amount}\` messages.` : "Cleared \`1\` message.";
    }

    channel.bulkDelete(amount);
    channel.send(response).then(msg => setTimeout(() => msg.delete(), clientSettings.MSGTIMEOUT_TASKCOMPLETED));
}