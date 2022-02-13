// Set the bot's prefix for the current guild

const { userMention, memberNicknameMention } = require('@discordjs/builders');
const mongo = require('../../modules/mongo');

const cmdName = "prefix";
const aliases = ["prfx", "pfx"];

const description = "Information regarding what this command does.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        if (commandData.args[0]) {
            let currentPrefixes = commandData.guildData.guildPrefixes;
            let newPrefixes = [
                commandData.args[0].toLowerCase(),
                userMention(client.user.id),
                memberNicknameMention(client.user.id)
            ];

            mongo.updateGuild(message.guild.id, { guildPrefixes: newPrefixes }).then(async newGuildData => {
                return await message.channel.send({
                    content: `Server prefix changed from \`${currentPrefixes[0]}\` to \`${newPrefixes[0]}\`.`
                });
            });
        } else
            return await message.channel.send({ content: `My current prefix is \`${commandData.guildData.guildPrefixes[0]}\`` });
    }
}