// Guild info embed templates for quick and clean embedding.

const { MessageEmbed } = require('discord.js');
const { time } = require('@discordjs/builders');

// const clientSettings = require('../configs/clientSettings.json');

module.exports = {
    roleInfo_ES: (role, keyPermissions, foundBy="") => {
        let created_timestamp = time(role.createdAt, "R");
    
        let position = `${role.position}`;
        let hoisted = (role.hoist) ? "True" : "False";
        let mentionable = (role.mentionable) ? "True" : "False";

        let color = role.hexColor.toUpperCase();
    
        let embed = new MessageEmbed()
            .addField("Created", created_timestamp, true)
            .addField("Mention", `${role}`, true)
            .addField("ID", `${role.id}`, true)
            
            .addField("Position", position, true)
            .addField("Hoisted", hoisted, true)
            .addField("Mentionable", mentionable, true)
            
            .addField("Color", color, true)
    
            .addField(`Key Permissions (${keyPermissions.length})`, keyPermissions.joinedList || "None")
    
            .setColor(color.replace("#", ""));

        // Dynamic embed title based on whether the user infoed a role mention, role id, or their own role
        // Fail-safe in case (foundBy) doesn't have a proper case
        embed.setTitle(`Displaying information about role (${role.name})`);

        switch (foundBy) {
            case "mention": embed.setTitle(`Displaying information on mentioned role (${role.name})`); break;
            case "id": embed.setTitle(`Displaying information about ID'd role (${role.name})`); break;
            case "self": embed.setTitle(`Displaying information about your highest role (${role.name})`); break;
        }
    
        return embed;
    },

    memberInfo_ES: (guild, member, keyPermissions, roles, warns, foundBy="") => {
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

        console.log(warns);
        console.log(Array.isArray(warns));
        
        // Creating the (userinfo) embed:
        let embed = new MessageEmbed()
            .setThumbnail(member.user.avatarURL())
    
            .addField("Avatar", `[128px](${avatar_128}) - [256px](${avatar_256}) - [512px](${avatar_512}) - [1024px](${avatar_1024})`)
    
            .addField("Account Registered", accountRegistered, true)
            .addField("Joined Server", joinedGuild, true)
    
            .addField("Mention", `${member.user}`, true)
    
            .addField("Server Owner", member_isOwner, true)
            .addField("Server Admin", member_isAdmin, true)
            .addField("Bot", member_isBot, true)
            
            .addField(`Key Permissions (${keyPermissions.length || "0"})`, keyPermissions.joinedList || keyPermissions.key)
            .addField(`Roles (${roles.length || "0"})`, roles.joinedList || roles)
            .addField(`Warns (${(Array.isArray(warns)) ? "69" : 0})`, "test1" /* warns.formatted || warns */) /* ${(Array.isArray(warns)) ? warns.length : "0"} */
    
            .setFooter(`MemberId: ${member.user.id}`)
    
            .setColor(member_color);

        // Dynamic embed title based on whether the user infoed a user mention, user id, or theirself
        // Fail-safe incase (foundBy) doesn't have a proper case
        embed.setAuthor(`Displaying information for **${member.user.tag}**`, member.user.avatarURL());

        switch (foundBy) {
            case "mention": embed.setAuthor(`Displaying information for mentioned member **${member.user.tag}**`, member.user.avatarURL()); break;
            case "id": embed.setAuthor(`Displaying information on ID'd member **${member.user.tag}**`, member.user.avatarURL()); break;
            case "self": embed.setAuthor(`Displaying information about yourself (**${member.user.tag}**)`, member.user.avatarURL()); break;
        }
    
        return embed;
    },

    memberWarns_ES: (member, warns, foundBy="") => {
        // TODO: add pages if the list is too long

        let member_color = member.roles.highest.hexColor.toUpperCase().replace("#", "");

        let embed = new MessageEmbed()
            .setThumbnail(member.user.avatarURL())
    
            .addField(`Warns (test0)`, "test1" /* warns.formatted || warns */) /* ${(Array.isArray(warns)) ? warns.length : "0"} */
    
            .setFooter(`MemberId: ${member.user.id}`)

            .setColor(member_color);

        // Dynamic embed title based on whether the user infoed a user mention, user id, or theirself
        // Fail-safe incase (foundBy) doesn't have a proper case
        embed.setAuthor(`Displaying warnings for member **${member.user.tag}**`, member.user.avatarURL());

        // TODO: set embed thumbnail to "warning" icon instead of member's pfp

        switch (foundBy) {
            case "mention": embed.setAuthor(`Displaying warnings for mentioned member **${member.user.tag}**`, member.user.avatarURL()); break;
            case "id": embed.setAuthor(`Displaying warnings on ID'd member **${member.user.tag}**`, member.user.avatarURL()); break;
            case "self": embed.setAuthor(`Displaying warnings for yourself (**${member.user.tag}**)`, member.user.avatarURL()); break;
        }
    
        return embed;
    },

    memberRoles_ES: (member, roles, foundBy="") => {
        // TODO: add pages if the list is too long
        
        let member_color = member.roles.highest.hexColor.toUpperCase().replace("#", "");
        
        let embed = new MessageEmbed()
            .setThumbnail(member.user.avatarURL())
    
            .addField(`Roles (${roles.length || "0"})`, roles.joinedList || roles)
    
            .setFooter(`MemberId: ${member.user.id}`)

            .setColor(member_color);

        // Dynamic embed title based on whether the user infoed a user mention, user id, or theirself
        // Fail-safe incase (foundBy) doesn't have a proper case
        embed.setAuthor(`Displaying roles for ${member.user.tag}`, member.user.avatarURL());

        // TODO: set embed thumbnail to "roles" icon instead of member's pfp

        switch (foundBy) {
            case "mention": embed.setAuthor(`Displaying roles for mentioned member **${member.user.tag}**`, member.user.avatarURL()); break;
            case "id": embed.setAuthor(`Displaying roles on ID'd member **${member.user.tag}**`, member.user.avatarURL()); break;
            case "self": embed.setAuthor(`Displaying roles for yourself (**${member.user.tag}**)`, member.user.avatarURL()); break;
        }
    
        return embed;
    },

    memberPermissions_ES: (member, permissions, foundBy="") => {
        let member_color = member.roles.highest.hexColor.toUpperCase().replace("#", "");
    
        const embed = new MessageEmbed()
            .setThumbnail(member.user.avatarURL())
    
            .addField(`Key Permissions (${permissions.length || "0"})`, permissions.joinedList || permissions.key)
            .addField(`Other permissions (${
                permissions.length || permissions.other.length || "0"})`, 
                permissions.joinedAll || permissions.other.joinedAll || permissions.other
            )
    
            .setFooter(`MemberId: ${member.user.id}`)

            .setColor(member_color);

        // Dynamic embed title based on whether the user infoed a user mention, user id, or theirself
        // Fail-safe incase (foundBy) doesn't have a proper case
        embed.setAuthor(`Displaying permissions for ${member.user.tag}`, member.user.avatarURL());

        // TODO: set embed thumbnail to "permissions" icon instead of member's pfp

        switch (foundBy) {
            case "mention": embed.setAuthor(`Displaying permissions for mentioned member **${member.user.tag}**`, member.user.avatarURL()); break;
            case "id": embed.setAuthor(`Displaying permissions on ID'd member **${member.user.tag}**`, member.user.avatarURL()); break;
            case "self": embed.setAuthor(`Displaying permissions for yourself (**${member.user.tag}**)`, member.user.avatarURL()); break;
        }
    
        return embed;
    }
}