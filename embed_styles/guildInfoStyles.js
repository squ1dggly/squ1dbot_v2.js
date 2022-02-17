// Guild info embed templates for quick and clean embedding.

const { MessageEmbed } = require('discord.js');
const { time } = require('@discordjs/builders');

const { embedColor } = require('../configs/clientSettings.json');

function FormatMemberWarns(warns, limit) {
    if (warns.length === 0) return "None";

    if (limit > 0)
        if (warns.length > limit) {
            let remainder = warns.length - limit;

            warns = warns.slice(0, limit);
            warns.push(`*+ ${remainder} more...*`);
        }

    let formatted = "";
    warns.forEach(warn => warn.id ? formatted += `${warn.formatted}\n\n` : formatted += warn);

    return {
        length: warns.length,
        list: warns,
        formatted: formatted
    }
}

module.exports = {
    roleInfo_ES: (role, keyPermissions) => {
        let created_timestamp = time(role.createdAt, "R");

        let position = `${role.position}`;
        let hoisted = (role.hoist) ? "True" : "False";
        let mentionable = (role.mentionable) ? "True" : "False";

        let color = role.hexColor.toUpperCase();

        let embed = new MessageEmbed()
            .setTitle(`Displaying information for role: ${role.name}`)

            .addField("Created", created_timestamp, true)
            .addField("Mention", `${role}`, true)
            .addField("ID", `${role.id}`, true)

            .addField("Position", position, true)
            .addField("Hoisted", hoisted, true)
            .addField("Mentionable", mentionable, true)

            .addField("Color", color, true)

            .addField(`Key Permissions (${(keyPermissions.list) ? keyPermissions.list.length : "0"})`, keyPermissions.joinedList || "None")

            .setColor(color.replace("#", ""));

        return embed;
    },

    memberInfo_ES: (guild, member, keyPermissions, roles, warns) => {
        warns = FormatMemberWarns(warns, limit);

        let avatar_128 = member.user.displayAvatarURL({ dynamic: true, size: 128 });
        let avatar_256 = member.user.displayAvatarURL({ dynamic: true, size: 256 });
        let avatar_512 = member.user.displayAvatarURL({ dynamic: true, size: 512 });
        let avatar_1024 = member.user.displayAvatarURL({ dynamic: true, size: 1024 });

        let accountRegistered = time(member.user.createdAt, "R");
        let joinedGuild = time(member.joinedAt, "R");

        let member_isOwner = (guild.ownerId == member.id) ? "True" : "False";
        let member_isAdmin = (member.permissions.has("ADMINISTRATOR")) ? "True" : "False";
        let member_isBot = (member.user.bot) ? "True" : "False";

        let member_color = member.roles.highest.hexColor.toUpperCase().replace("#", "");

        // Creating the (userinfo) embed:
        let embed = new MessageEmbed()
            .setAuthor({ name: `Displaying information on: ${member.user.tag}`, url: member.user.avatarURL() })

            .addField("Avatar", `[128px](${avatar_128}) - [256px](${avatar_256}) - [512px](${avatar_512}) - [1024px](${avatar_1024})`)

            .addField("Account Registered", accountRegistered, true)
            .addField("Joined Server", joinedGuild, true)

            .addField("Mention", `${member.user}`, true)

            .addField("Server Owner", member_isOwner, true)
            .addField("Server Admin", member_isAdmin, true)
            .addField("Bot", member_isBot, true)

            .addField(`Key Permissions (${keyPermissions.length || "0"})`, keyPermissions.joinedList || keyPermissions.key)
            .addField(`Roles (${roles.length || "0"})`, roles.joinedList || roles)
            .addField(`Warns (${(warns.list) ? warns.length.toString() : "0"})`, warns.formatted || warns)

            .setColor(member_color);

        return embed;
    },

    memberWarns_ES: (member, warns, limit) => {
        warns = FormatMemberWarns(warns, limit);

        // TODO: add pages if the list is too long

        let member_color = member.roles.highest.hexColor.toUpperCase().replace("#", "");

        let embed = new MessageEmbed()
            .setAuthor({ name: `Displaying warnings for: ${member.user.tag}`, url: member.user.avatarURL() })
            .addField(`Warns (${(warns.list) ? warns.length.toString() : "0"})`, warns.formatted || warns)
            .setColor(member_color);

        // TODO: set embed thumbnail to "warnings" icon instead of member's pfp

        return embed;
    },

    memberRoles_ES: (member, roles) => {
        // TODO: add pages if the list is too long

        let member_color = member.roles.highest.hexColor.toUpperCase().replace("#", "");

        let embed = new MessageEmbed()
            .setAuthor({ name: `Displaying roles for: ${member.user.tag}`, url: member.user.avatarURL() })
            .addField(`Roles (${roles.length || "0"})`, roles.joinedList || roles)
            .setColor(member_color);

        return embed;
    },

    memberPermissions_ES: (member, permissions) => {
        let member_color = member.roles.highest.hexColor.toUpperCase().replace("#", "");

        const embed = new MessageEmbed()
            .setAuthor({ name: `Displaying permissions for: ${member.user.tag}`, url: member.user.avatarURL() })

            .addField(`Key Permissions (${permissions.length || "0"})`, permissions.joinedList || permissions.key)
            .addField(`Other permissions (${permissions.length || permissions.other.length || "0"})`,
                permissions.joinedAll || permissions.other.joinedAll || permissions.other
            )

            .setColor(member_color);

        // TODO: set embed thumbnail to "permissions" icon instead of member's pfp

        return embed;
    },

    clientPermissionsUnavailable_ES: (permissionList) => {
        let embed = new MessageEmbed()
            .setTitle("Access Denied:")
            .addField("I do not have the following permissions needed run this command:", permissionList)
            .setColor(embedColor.ERROR);

        return embed;
    },

    formatMemberWarns: FormatMemberWarns
}