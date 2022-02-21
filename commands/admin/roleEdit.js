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
        let roles;

        if (message.mentions.roles.size > 0)
            roles = message.mentions.roles.size.map(r => r);
        else {
            roles = [];

            commandData.splitContent(",").forEach(async arg => {
                console.log(arg);

                let fetched = await GetRoleFromNameOrID(message.guild, arg.toLowerCase());
                console.log(fetched.name);

                if (fetched) roles.push(fetched);
            });
        }

        console.log(roles);

        // if (message.mentions.roles.size > 0) roles = message.mentions.roles.map(r => r);

        /* if (roles.length === 0) {
            let roles = [];
            commandData.splitContent(",").forEach(arg => {
                GetRoleFromNameOrID(message.guild, arg.toLowerCase()).then(r => roles.push(r));
            });

            if (roles.length === 0) return await message.reply({
                content: "You have to mention at least one role to edit it."
            });
        }

        console.log(roles);

        if (roles.length === 0) return await message.reply({
            content: "You have to mention at least one role to edit it."
        }); */

        /* let mentionedRoles = "";
        roles.forEach(role => mentionedRoles += `${role} `);

        let embed = new MessageEmbed()
            .setTitle("Mentioned Roles:")
            .setDescription(mentionedRoles)
            .setColor(embedColor.MAIN);

        return await message.channel.send({ embeds: [embed] }); */
    }
}