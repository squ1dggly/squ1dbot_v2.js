// Process any commands that were run in the user's message.

const { userMention } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

const { CREATOR_ID, timeouts, errorMsg } = require('../../configs/clientSettings.json');
const { TestForPermissions } = require('../../modules/guildTools');
const { CleanStringArrayWhitespace } = require('../../modules/jsTools');
const { clientPermissionsUnavailable_ES } = require('../../embed_styles/guildInfoStyles');

module.exports = {
    name: "Process Command",
    event: "messageCreate",

    execute: async (client, message, guildData) => {
        // Prevents the bot from responding to itself and other bots
        if (message.author.id === client.user.id) return;
        if (message.author.bot) return;

        // Checks if the message starts with one of our command prefixes
        let prefixUsed = StartsWithPrefix(message.content, guildData);
        if (!prefixUsed) return;

        // Prevents users from spamming commands
        if (MessageCooldownCheck(client, message))
            if (await message.fetch())
                return await message.react("⏳");

        // Formats our message since the message did contain one of our prefixes
        let messageContent = message.content.toLowerCase().substring(prefixUsed.length);
        let args = messageContent.split(" ");

        // Gets the appropriate command if it exists
        let command = client.commands.get(args[0]) || client.commandAliases.get(args[0]);

        if (command) {
            try {
                // If the command is an admin command
                // prevent the user from running the command if they themselves don't have administrative permission in the guild
                if (command.requireGuildMemberHaveAdmin) {
                    let specialPermissionTest = TestForPermissions(message.member.permissions, Permissions.FLAGS.ADMINISTRATOR);
                    if (!specialPermissionTest.passed)
                        return await message.reply({ content: `Look who showed up with a knife to a gun fight.\nYou don't seem to have the \`${specialPermissionTest.requiredPermissions}\` permission. How do you expect to use this command?` });
                }

                // Checks if we have the required permissions if the command uses anything special
                if (command.specialPermissions) {
                    let specialPermissionTest = TestForPermissions(message.guild.me.permissions, command.specialPermissions);
                    if (!specialPermissionTest.passed)
                        return await message.reply({ embeds: [clientPermissionsUnavailable_ES(specialPermissionTest.requiredPermissions)] });
                }

                // Now that that's out of the way... Let's actually run the command if we're able to
                let commandUsed = args[0];
                args.shift();
                args = CleanStringArrayWhitespace(args);

                let commandData = {
                    args: args,
                    commandUsed: commandUsed,
                    guildData: guildData,
                    cleanContent: messageContent,
                    splitContent: (seperator, lowerCase = false) => {
                        if (lowerCase)
                            return CleanStringArrayWhitespace(args.join(" ").toLowerCase().split(seperator));
                        else
                            return CleanStringArrayWhitespace(args.join(" ").split(seperator));
                    }
                }

                return await command.execute(client, message, commandData);
            } catch (err) {
                console.error(`Failed to execute command \"${command.name}\"`, err);

                return await message.reply(errorMsg.COMMANDFAILEDMISERABLY
                    .replace("$CMDNAME", command.name)
                    .replace("$CREATORTAG", userMention(CREATOR_ID))
                );
            }
        }
    }
}

// >> Custom Functions
// Checks if the user used any of the bot's prefixes
function StartsWithPrefix(message, guildData) {
    return guildData.guildPrefixes.find(prfx => message.startsWith(prfx));
}

// Removes all entries if they are over the (MSGTIMEOUT_CMDCOOLDOWN) time limit
function MessageCooldownCheck(client, message) {
    for (let entry in client.cmdCooldownCache)
        if (client.cmdCooldownCache.get(entry) > client.MSGTIMEOUT_CMDCOOLDOWN)
            client.cmdCooldownCache.delete(entry);

    let timeDifference = message.createdTimestamp - client.cmdCooldownCache.get(message.channel.id) || timeouts.cooldown.COMMAND + 1;

    if (timeDifference >= timeouts.cooldown.COMMAND) {
        client.cmdCooldownCache.set(message.channel.id, message.createdTimestamp);
        return false;
    } else
        return true;
}