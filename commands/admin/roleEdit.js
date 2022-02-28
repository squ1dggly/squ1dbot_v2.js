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

        // Embed
        let embed = new MessageEmbed()
            .setTitle(roles.length > 1 ? `Bulk Editing Roles` : `Editing Role`)
            .setDescription("a description that's supposed to tell you how any of this shit works except it doesn't")
            .setTimestamp(message.createdAt)
            .setColor(embedColor.MAIN)

            .addField(
                `Selected Roles (${roles.length}):`,
                `${roles.join("\n")}`
            );

        // Buttons
        let btn_changeColor = new MessageButton()
            .setLabel(roles.length > 1 ? `Change Colors` : `Change Color`)
            .setCustomId("changeColor")
            .setStyle("SECONDARY");

        let btn_editPermissions = new MessageButton()
            .setLabel("Edit Permissions")
            .setCustomId("editPermissions")
            .setStyle("SECONDARY");

        let btn_delete = new MessageButton()
            .setLabel(roles.length > 1 ? `Delete Roles (${roles.length})` : `Delete Role`)
            .setCustomId("delete")
            .setStyle("DANGER");

        // Action Row
        let actionRow = new MessageActionRow()
            .addComponents(btn_changeColor, btn_editPermissions, btn_delete);

        // Send
        return await message.channel.send({ embeds: [embed], components: [actionRow] });
    }
}