// Get information about a member of the server. (W.I.P more than likely broken)

const { SlashCommandBuilder, time} = require('@discordjs/builders');
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

    return { length: warns.length, list: warns, foramtted: formatted }
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

module.exports = { // CURRENTLY WORKING ON THIS (NOT FINISHED!!!) (also hasn't even been edited yet)
    data: new SlashCommandBuilder()
        .setName("infomember")
        .setDescription("Get information about a member in the server.")
        .addUserOption(option => option.setName("member").setDescription("The member you want to info"))
        .addStringOption(option => option.setName("member-id").setDescription("Ther member you want to info using their id"))
        .addBooleanOption(option => option.setName("ephemeral").setDescription("If set to true only you will be able to see this message")),

    execute: async (client, interaction) => {
        const member = interaction.options.getUser("member");
        const member_id = interaction.options.getString("member-id");
        const ephemeral = interaction.options.getBoolean("ephemeral") || false;

        let guild_member;

        if (member)
            guild_member = await interaction.guild.members.fetch(member.id);
        else if (member_id)
            try { guild_member = await interaction.guild.members.fetch(member_id); }
            catch { return interaction.reply({ content: "Could not find member using the provided id.", ephemeral: true }); }
        else
            guild_member = interaction.member;

        await infoMember(client, interaction, guild_member, ephemeral);
    }
}

async function infoMember (client, interaction, guild_member, ephemeral) {
    // Message Embed:
    const warn_array = await mongo.retrieveUserWarns(interaction.guild.id, guild_member.id);
    const memberInfo_embed = memberInfoEmbed(client, interaction, guild_member, warn_array);

    interaction.reply({ embeds: [memberInfo_embed], components: [actionRow()], ephemeral: ephemeral });

    // Message Component Collector:
    const collector = interaction.channel.createMessageComponentCollector({
        componentType: "SELECT_MENU",
        time: clientSettings.MSGTIMEOUT_SELECTMENU
    });

    collector.on("collect", i => {
        i.deferUpdate();
        collector.resetTimer();
        
        if (i.user.id != interaction.user.id) return;

        switch (i.values[0]) {
            case "member_info":
                interaction.editReply({
                    embeds: [memberInfo_embed],
                    components: [actionRow("1000")]
                });
                break;

            case "member_warns":
                interaction.editReply({
                    embeds: [memberWarnsEmbed(client, interaction, guild_member, warn_array)],
                    components: [actionRow("0100")]
                });
                break;

            case "member_permissions":
                interaction.editReply({
                    embeds: [memberPermissionsEmbed(client, interaction, guild_member)],
                    components: [actionRow("0010")]
                });
                break;

            case "member_roles":
                interaction.editReply({
                    embeds: [memberRolesEmbed(client, interaction, guild_member)],
                    components: [actionRow("0001")]
                });
                break;
        }
    });

    collector.on("end", async i => {
        try { interaction.editReply({ components: [] }); }
        catch (err) { console.error("Failed to remove ACTION_ROW:", err) }
    });
}