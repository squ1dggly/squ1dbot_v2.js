// Update one or more existing role all at once.

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { GetRoleFromNameOrID } = require('../../modules/guildTools');
const { embedColor } = require('../../configs/clientSettings.json');

const cmdName = "editrole";
const aliases = [];

const description = "Update one or more existing role all at once.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        let roles = message.mentions.roles.size > 0 ? message.mentions.roles.map(r => r) : null;

        if (!roles && commandData.args.length > 0) {
            let roleArgs = commandData.splitContent(",");
            roles = await Promise.all(roleArgs.map(arg => GetRoleFromNameOrID(message.guild, arg.toLowerCase())));

            if (roles.length === 0) return await message.reply({
                content: "I couldn't find any of the roles you mentioned. Try not being dislexic next time."
            });
        } else if (!roles && commandData.args.length === 0) return await message.reply({
            content: "You have to mention at least 1 role to use this command. I'm not *that* dumb."
        });

        let embed = new MessageEmbed().setTitle(roles.map(r => `${r}`));

        return await message.channel.send({ embeds: [embed] });
    }
}