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
        let roles = message.mentions.roles;

        if (roles.size === 0 && commandData.args.length > 0) {
            let roleArgs = commandData.splitContent(",");
            let fetchedRoles = [];

            await roleArgs.forEach(async arg => {
                let fetched = await GetRoleFromNameOrID(message.guild, arg);
                if (fetched) fetchedRoles.push(fetched);
            });

            console.log(fetchedRoles);

            if (roles.size === 0) return await message.reply({
                content: "You have to mention at least one role to edit it."
            });
        } else if (roles.size < 1 && commandData.args.length < 1) return await message.reply({
            content: "You have to mention at least one role to edit it."
        });

        console.log(roles);

        let mentionedRoles = "";
        roles.forEach(role => mentionedRoles += `${role} `);

        let embed = new MessageEmbed()
            .setTitle("Mentioned Roles:")
            .setDescription(mentionedRoles)
            .setColor(embedColor.MAIN);

        return await message.channel.send({ embeds: [embed] });
    }
}