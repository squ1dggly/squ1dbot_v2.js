// Get information about a role in the server.

const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const importantPerms = [
    "ADMINISTRATOR",
    "MANAGE_MESSAGES",
    "MANAGE_CHANNELS",
    "MANAGE_GUILD",
    "MANAGE_ROLES",
    "BAN_MEMBERS",
    "KICK_MEMBERS",
    "MENTION_EVERYONE"
];

function findImportantPermissions(perm_array = []) {
    const perms = [];

    perm_array.forEach(perm => {
        importantPerms.forEach(important_perm => {
            if (perm == important_perm) perms.push(`\`${important_perm}\``);
        });
    });

    return (perms.length > 0) ? perms : "None";
}

const roleInfoEmbed = (interaction, role) => {
    const created_timestamp = time(role.createdAt, "R");
    // const mention = role.id;
    // const id = role.id;

    const position = `${role.position}`;
    const hoisted = (role.hoist) ? "True" : "False";
    const mentionable = (role.mentionable) ? "True" : "False";
    
    const hex_color = role.hexColor.toUpperCase();

    let key_perms = findImportantPermissions(role.permissions.toArray());
    let kperm_length = 0;
    if (Array.isArray(key_perms)) {
        kperm_length = key_perms.length;
        key_perms = key_perms.join(", ");
    }

    const embed = new MessageEmbed()
        .setTitle(`Displaying information about role [${role.name}]`)
        
        .addField("Created", created_timestamp, true)
        .addField("Mention", `${role}`, true)
        .addField("ID", `${role.id}`, true)
        
        .addField("Position", position, true)
        .addField("Hoisted", hoisted, true)
        .addField("Mentionable", mentionable, true)
        
        .addField("Color", hex_color, true)

        .addField(`Key Permissions (${kperm_length})`, key_perms)

        .setColor(hex_color.replace("#", ""));

    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inforole")
        .setDescription("Get information about a role in the server.")
        .addRoleOption(option => option.setName("role").setDescription("The role you want to info."))
        .addBooleanOption(option => option.setName("ephemeral").setDescription("If set to true only you will be able to see this message")),

    execute: async (client, interaction) => {
        const role = interaction.options.getRole("role") || interaction.member.roles.highest;
        const ephemeral = interaction.options.getBoolean("ephemeral") || false;

        interaction.reply({ embeds: [roleInfoEmbed(interaction, role)], ephemeral: ephemeral });
    }
}