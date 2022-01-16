// Process any commands that were run in the user's message.

const clientSettings = require('../../configs/clientSettings.json');

function checkForPrefix(message, guildData) {
    return guildData.guildPrefixes.find(pfx => {
        if (message.startsWith(pfx))
            return pfx;
    });
}

function messageCooldownCheck(client, message) {
    // Removes all entries if they are over the (MSGTIMEOUT_CMDCOOLDOWN) time limit
    for (let entry in client.cmdCooldownCache) {
        if (client.cmdCooldownCache.get(entry) > client.MSGTIMEOUT_CMDCOOLDOWN)
            client.cmdCooldownCache.delete(entry);
    }

    let timeDifference = message.createdTimestamp - client.cmdCooldownCache.get(message.channel.id) || clientSettings.MSGTIMEOUT_CMDCOOLDOWN+1;

    if (timeDifference >= clientSettings.MSGTIMEOUT_CMDCOOLDOWN) {
        client.cmdCooldownCache.set(message.channel.id, message.createdTimestamp);

        return false;
    } else
        return true;
}

module.exports = {
    name: "Process Command",
    event: "messageCreate",

    execute: async (client, message, guildData) => {
        if (message.author.id === client.user.id) return;
        if (message.author.bot) return;

        // Checks if the message contained our bot prefix
        let prefixUsed = checkForPrefix(message.content, guildData);

        if (!prefixUsed) return;
        if (messageCooldownCheck(client, message))
            if (await message.fetch())
                return message.react("⌛");

        // Formats our message since the message did contain one of our prefixes
        let messageContent = message.content.toLowerCase().substring(prefixUsed.length);
        let args = messageContent.split(" ");

        // Executes the appropriate command if it exists
        let command = client.commands.get(args[0]) || client.commandAliases.get(args[0]);

        if (command) {
            try {
                if (command.isAdminCommand) {
                    // Check if the bot has admin perms
                    if (!message.guild.me.permissions.has("ADMINISTRATOR"))
                        return message.reply("I don't have permission to execute this command. Give admin when?");

                    // Check if the user that called the interaction is either an (admin) or the (bot creator)
                    if (!message.member.permissions.has("ADMINISTRATOR"))
                        if (!message.author.id != clientSettings.CREATOR) {
                            let responses = clientSettings.ERRORMSG_NOADMINPERMS;
                            return message.reply(responses[Math.floor(Math.random() * responses.length)]);
                        }
                }

                let commandUsed = args[0];
                args.shift();

                let commandData = {
                    args: args,
                    commandUsed: commandUsed,
                    guildData: guildData,
                    cleanContent: messageContent,
                    splitContent: (seperator) => { return messageContent.split(seperator) }
                }

                return await command.execute(client, message, commandData);
            } catch (err) { return console.error(`Failed to execute command \"${command.name}\"`, err); }
        }
    }
}