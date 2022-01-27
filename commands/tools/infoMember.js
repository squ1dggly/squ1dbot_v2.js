// Get information about a member of the server.

const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { memberInfo_ES, memberWarns_ES, memberRoles_ES, memberPermissions_ES } = require('../../embed_styles/guildInfoStyles');

const { timeouts } = require('../../configs/clientSettings.json');
const mongo = require('../../modules/mongo');

const importantPermissions = [
    "ADMINISTRATOR",
    "MANAGE_MESSAGES",
    "MANAGE_CHANNELS",
    "MANAGE_GUILD",
    "MANAGE_ROLES",
    "BAN_MEMBERS",
    "KICK_MEMBERS",
    "MENTION_EVERYONE"
];

function FormatMemberPermissions(arr=[]) {
    // TODO: arrange permissions in alphabetical order

    let keyPerms = [];

    arr.forEach(perm => {
        importantPermissions.forEach(importantPerm => {
            if (perm === importantPerm) keyPerms.push(`\`${importantPerm}\``);
        });
    });

    return (keyPerms.length > 0) ? {
        length: arr.length,
        keyLength: keyPerms.length,
        list: keyPerms,
        all: arr,
        joinedList: keyPerms.join(", "),
        joinedAll: arr.join(", ")
    } : {
            key: "None",
            other: (arr.length > 0) ? { length: arr.length, all: arr, joinedAll: arr.join(", ") } : "None" // ??
        };
}

function FormatMemberRoles(roles, limit=0) {
    roles.reverse(); // Flips the array so the roles are in the right order, from highest to lowest
    roles.shift(); // Removes the 1st role in the array which would be (@everyone)

    if (limit > 0)
        if (roles.length > limit) {
            let remainder = roles.length - limit;
            
            roles = roles.slice(0, limit);
            roles.push(`*+ ${remainder} more...*`);
        }

    return (roles.length > 0) ? { length: roles.length, list: roles, joinedList: roles.join("\n") } : "None";
}

function FormatMemberWarns(warns, limit=0) {
    if (warns.length === 0) return "None";

    if (limit > 0)
        if (warns.length > limit) {
            let remainder = warns.length - limit;
            
            warns = warns.slice(0, limit);
            warns.push(`*+ ${remainder} more...*`);
        }

    let formatted = "";

    warns.forEach(warn => {
        if (warn.id) formatted += `${warn.formatted}\n\n`; else formatted += warn;
    });

    return { length: warns.length, list: warns, formatted: formatted }
}

// Components:
function CreateActionRow (d="1000") {
    let row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
            .setCustomId("memberinfo_selectmenu")
            .addOptions([
                {
                    label: "View Info",
                    description: "View information on this member",
                    emoji: { name: "info", id: "895224486566178816" },
                    default: (d[0] == "1") ? true : false,
                    value: "member_info"
                },
                {
                    label: "View Roles",
                    description: "View member roles",
                    emoji: { name: "📝" },
                    default: (d[1] == "1") ? true : false,
                    value: "member_roles"
                },
                {
                    label: "View Warns",
                    description: "View member warns",
                    emoji: { name: "⚠️" },
                    default: (d[2] == "1") ? true : false,
                    value: "member_warns"
                },
                {
                    label: "View Permissons",
                    description: "View member permissions",
                    emoji: { name: "⚙️" },
                    default: (d[3] == "1") ? true : false,
                    value: "member_permissions"
                }
            ])
    );

    return row;
}

const cmdName = "infomember";
const aliases = ["memberinfo", "userinfo", "infouser"];

const description = "Get information about a member of the server.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        let user = message.mentions.members.first() || commandData.args[0] || message.member;
        let guildMember;

        if (user.id === message.author.id) { guildMember = user; }

        if (!guildMember) {
            if (user.id) guildMember = await message.guild.members.fetch(user.id);
            else if (user != "")
                try { guildMember = await message.guild.members.fetch(user); }
                catch { return message.channel.send("I wasn't able to find the member you mentioned. That sly dawg!"); }
        }

        let member_roles = FormatMemberRoles(guildMember.roles.cache.map(r => r), 9);
        let member_warns = FormatMemberWarns(await mongo.retrieveUserWarns(message.guild.id, guildMember.id));
        
        let member_permisions = FormatMemberPermissions(guildMember.permissions.toArray());

        // Preparing embeds
        let memberInfo_embed = memberInfo_ES(message.guild, guildMember, member_permisions, member_roles, member_warns);
        let memberRoles_embed = memberRoles_ES(guildMember, member_roles);
        let memberWarns_embed = memberWarns_ES(guildMember, member_warns);
        let memberPermissions_embed =  memberPermissions_ES(guildMember, member_permisions);

        let miMessage = await message.channel.send({ embeds: [memberInfo_embed], components: [CreateActionRow("1000")] });

        // Message Component Collector:
        let collector = miMessage.createMessageComponentCollector({
            componentType: "SELECT_MENU",
            time: timeouts.interaction.SELECTMENU
        }); 
        
        collector.on("collect", i => {
            if (i.user.id != message.author.id) return;
            collector.resetTimer();
            i.deferUpdate();
            
            // QUESTION: should the embeds be created on the fly or stay static?
            // could save some command processing time if the user doesn't even use the select menu options
            // but also a little taxing on the bot if they do switch embeds frequently

            switch (i.values[0]) {
                case "member_info":
                    miMessage.edit({
                        embeds: [memberInfo_embed],
                        components: [CreateActionRow("1000")]
                    });
                    break;
                    
                case "member_roles":
                    miMessage.edit({
                        embeds: [memberRoles_embed],
                        components: [CreateActionRow("0100")]
                    });
                    break;

                case "member_warns":
                    miMessage.edit({
                        embeds: [memberWarns_embed],
                        components: [CreateActionRow("0010")]
                    });
                    break;
    
                case "member_permissions":
                    miMessage.edit({
                        embeds: [memberPermissions_embed],
                        components: [CreateActionRow("0001")]
                    });
                    break;
            }
        });

        // On collector timeout: (this should work now)
        collector.on("end", async i => {
            try { miMessage.edit(({ components: [] })); }
            catch (err) { console.error("Failed to remove ACTION_ROW: ", err) }
        });
    }
}