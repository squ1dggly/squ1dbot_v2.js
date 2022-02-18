// Get information about a role in the server.

const { roleInfo_ES } = require('../../embed_styles/guildInfoStyles');

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

function findImportantPermissions(arr=[]) {
    const perms = [];

    arr.forEach(perm => {
        importantPermissions.forEach(importantPerm => {
            if (perm === importantPerm) perms.push(`\`${importantPerm}\``);
        });
    });

    return (perms.length > 0) ? { length: perms.length, list: perms, joinedList: perms.join(", ") } : "None";
}

const cmdName = "inforole";
const aliases = ["roleinfo"];

const description = "Get information about a role in the server.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        let mentionedRole = message.mentions.roles.first();
        let role;

        let foundBy = "";

        if (mentionedRole) {
            role = mentionedRole;
            foundBy = "mention";
        } else if (!isNaN(commandData.args[0]))
            try { role = await message.guild.roles.fetch(commandData.args[0]); foundBy = "id"; }
            catch { return message.channel.send("I was unable to find a role matching the ID you've given.") }
        else {
            role = message.member.roles.highest;
            foundBy = "self";
        }

        let role_permissions;
        try { role_permissions = findImportantPermissions(role.permissions.toArray()); }
        catch { return message.channel.send("I was unable to find any such role. Try again next year."); }

        message.channel.send({ embeds: [roleInfo_ES(role, role_permissions, foundBy)] });
    }
}