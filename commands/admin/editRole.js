// Update one or more existing role all at once.

const { Permissions, MessageActionRow, MessageButton } = require('discord.js');
const { GetRoleFromNameOrID, SelfDestructingMessage, DestroyMessageAfter } = require('../../modules/guildTools');
const { CleanArrayUndefined } = require('../../modules/jsTools');
const { roleEdit_CS } = require('../../embed_styles/commandStyles');

const { embedColor } = require('../../configs/clientSettings.json');

const cmdName = "editrole";
const aliases = ["er"];

const description = "Update one or more existing role all at once.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    requireGuildMemberHaveAdmin: true,
    specialPermissions: [Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_MESSAGES],

    execute: async (client, message, commandData) => {
        let roles = message.mentions.roles.size > 0 ? message.mentions.roles.map(r => r) : null;

        if (!roles && commandData.args.length > 0) {
            let roleArgs = commandData.splitContent(",");

            let CleanArrayDuplicateRoles = (arr) => {
                let newArr = [];
                let lastID;
                arr.forEach(item => {
                    if (item.id !== lastID)
                        newArr.push(item);

                    lastID = item.id;
                });

                return newArr;
            }

            roles = await Promise.all(roleArgs.map(arg => GetRoleFromNameOrID(message.guild, arg.toLowerCase())));
            roles = CleanArrayDuplicateRoles(CleanArrayUndefined(roles));

            if (roles.length === 0) return await message.reply({
                content: "I couldn't find any of the roles you mentioned. Try not being dislexic next time."
            });
        } else if (!roles && commandData.args.length === 0) return await message.reply({
            content: "You have to mention at least 1 role to use this command. I'm not *that* dumb."
        });

        // Embed
        let audit = [];
        let embed = roleEdit_CS({ message: message, selectedRoles: roles, audit: audit });
        let finishedByDelete = false;

        // Buttons
        let btn_changeColor = new MessageButton()
            .setLabel(roles.length > 1 ? `Change Colors` : `Change Color`)
            .setCustomId("changeColor")
            .setStyle("PRIMARY");

        let btn_editPermissions = new MessageButton()
            .setLabel("Edit Permissions")
            .setCustomId("editPermissions")
            .setStyle("PRIMARY");

        let btn_delete = new MessageButton()
            .setLabel(roles.length > 1 ? `Delete Roles (${roles.length})` : `Delete Role`)
            .setCustomId("delete")
            .setStyle("DANGER");

        let btn_done = new MessageButton()
            .setLabel("Done")
            .setCustomId("done")
            .setStyle("SUCCESS");

        let btn_confirm = new MessageButton()
            .setLabel("Confirm")
            .setCustomId("confirm")
            .setStyle("SUCCESS");

        let btn_cancel = new MessageButton()
            .setLabel("Cancel")
            .setCustomId("cancel")
            .setStyle("DANGER");

        // Action Row
        let actionRow = new MessageActionRow()
            .addComponents(btn_changeColor, btn_editPermissions, btn_delete, btn_done);

        let confirmationActionRow = new MessageActionRow()
            .addComponents(btn_cancel, btn_confirm);

        // Send
        return await message.channel.send({ embeds: [embed], components: [actionRow] }).then(async msg => {
            let collector = msg.createMessageComponentCollector({ componentType: "BUTTON", time: 15000 });

            collector.on("collect", async i => {
                i.deferUpdate();

                if (i.user.id !== message.author.id)
                    return await i.reply({ content: "You have no authority to use these buttons. Get your own.", ephemeral: true });

                collector.resetTimer();

                switch (i.customId) {
                    case "changeColor":
                        return await msg.reply({ content: `${message.author} Give me a valid color hex code.` }).then(async hexMsg => {
                            let awaitFilter = f => f.author.id === message.author.id;

                            return await hexMsg.channel.awaitMessages({ awaitFilter, max: 1, time: 7000 })
                                .then(async col => {
                                    collector.resetTimer();

                                    await Promise.all(roles.map(r => r.setColor(col.first().content.toLowerCase())))
                                        .then(async () => await col.first().delete())
                                        .catch(async () => {
                                            await col.first().delete();
                                            await SelfDestructingMessage(hexMsg.channel, { content: "That was an invalid hex code." }, 3000);
                                        });


                                    audit.push(`updated role ${roles.length > 1 ? "colors" : "color"} to #${col.first().content.toUpperCase()}`);
                                    embed = roleEdit_CS({ message: message, selectedRoles: roles, audit: audit });

                                    await msg.edit({ embeds: [embed] });
                                    return await hexMsg.delete();
                                })
                                .catch(async col => {
                                    collector.resetTimer();

                                    await hexMsg.delete();
                                    return await DestroyMessageAfter(hexMsg.edit({
                                        content: "I guess you didn't want to do anything after all."
                                    }), 3000);
                                });
                        });

                    case "delete":
                        return await message.reply({ content: `Are you sure you want to delete ${roles.length > 1 ? `(${roles.length}) roles?` : "this role?"}`, components: [confirmationActionRow] }).then(async confirmDelMsg => {
                            audit.push(`attempting to delete (${roles.length}) ${roles.length > 1 ? "roles" : "role"}`);
                            embed = roleEdit_CS({ message: message, selectedRoles: roles, audit: audit });
                            msg.edit({ embeds: [embed] });

                            let awaitFilter = i => { i.deferUpdate(); i.author.id === message.author.id; };

                            let confirmed = await confirmDelMsg.awaitMessageComponent({ awaitFilter, componentType: "BUTTON", max: 1, time: 5000 })
                                .then(async interaction => {
                                    switch (interaction.customId) {
                                        case "cancel": return false;
                                        case "confirm": return true;
                                    }
                                }).catch(() => { return false });

                            if (confirmed) {
                                confirmDelMsg.delete();

                                return await Promise.all(roles.map(r => r.delete())).then(() => {
                                    finishedByDelete = true;
                                    audit.push(`deleted (${roles.length}) ${roles.length > 1 ? "roles" : "role"}`);

                                    collector.stop();
                                });
                            } else {
                                audit.push(`chose not to delete (${roles.length}) ${roles.length > 1 ? "roles" : "role"}`);
                                embed = roleEdit_CS({ message: message, selectedRoles: roles, audit: audit });
                                msg.edit({ embeds: [embed] });

                                return DestroyMessageAfter(await confirmDelMsg.edit({ content: "It seems you weren't sure after all.", components: [] }), 5000);
                            }
                        });

                    case "done":
                        collector.stop();
                        break;
                }
            });

            collector.on("end", async col => {
                embed = roleEdit_CS({ message: message, selectedRoles: roles, audit: audit, finishedByDelete: finishedByDelete }, true);

                return await msg.edit({ embeds: [embed], components: [] }).catch(console.error);
            });
        });
    }
}