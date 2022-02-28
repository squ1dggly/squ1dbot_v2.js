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
            .setColor(embedColor.CONFIG);

        embed.addField(`Selected Roles (${roles.length}):`, `${roles.join("\n")}`);

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
        return await message.channel.send({ embeds: [embed], components: [actionRow] }).then(async msg => {
            let collector = msg.createMessageComponentCollector({ componentType: "BUTTON", time: 15000 });

            collector.on("collect", async i => {
                i.deferUpdate();

                if (i.user.id !== message.author.id)
                    return await i.reply({ content: "You have no authority to use these buttons. Get your own.", ephemeral: true });

                collector.resetTimer();

                switch (i.customId) {
                    case "delete":
                        return await Promise.all(roles.map(r => r.delete())).then(async () => {
                            let deletedRolesEmbed = new MessageEmbed()
                            .setTitle(roles.length > 1 ? `Multiple Roles Deleted Successfully` : `Role Deleted Successfully`)
                            .setDescription(`${roles.map(r => `${r.name}\n`)}`)
                            .setTimestamp(msg.createdAt)
                            .setColor(embedColor.APPROVED);
        
                            deletedRolesEmbed.addField("Changes (1):", "deleted role(s)");
        
                        return await msg.edit({ embeds: [deletedRolesEmbed], components: [] }).catch(console.error);  
                        });
                }
            });

            collector.on("end", async col => {
                let finishedEmbed = new MessageEmbed()
                    .setTitle(roles.length > 1 ? `Multiple Roles Edited Successfully` : `Role Edited Successfully`)
                    .setDescription(`${roles.join("\n")}`)
                    .setTimestamp(msg.createdAt)
                    .setColor(embedColor.APPROVED);

                finishedEmbed.addField("Changes (0):", "None");

                return await msg.edit({ embeds: [finishedEmbed], components: [] }).catch(console.error);
            });
        });
    }
}