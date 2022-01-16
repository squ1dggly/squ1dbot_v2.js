// Display a server member's avatar.

const { MessageEmbed } = require('discord.js');

const footers_me = [
    "you're definitely an 11/10 on my list!",
    "looking good! keep up the great work!",
    "you look breathtaking!",
    "absolutely stunning!"
];

const footers = [
    "they've done a great job!",
    "abosolutely breathtaking!",
    "absolutely stunning!",
    "69/10 would smash!",
    "outstanding form!"
];

const cmdName = "avatar";
const aliases = [];

const description = "Display a server member's avatar.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        let user = message.mentions.members.first() || commandData.args[0];
        let guild_member;

        // Checks if the user mentioned a user to view and if they didn't display their own avatar:
        if (user)
            try { guild_member = await message.guild.members.fetch(user.id || user); }
            catch { return message.channel.send("I wasn't able to find the member you mentioned. That sly dawg!"); }
        else
            guild_member = message.member;
        
        let avatar_128 = guild_member.user.displayAvatarURL({ dynamic: true, size: 128 });
        let avatar_256 = guild_member.user.displayAvatarURL({ dynamic: true, size: 256 });
        let avatar_512 = guild_member.user.displayAvatarURL({ dynamic: true, size: 512 });
        let avatar_1024 = guild_member.user.displayAvatarURL({ dynamic: true, size: 1024 });

        let accent_color = (await message.guild.members.fetch(guild_member.user.id)).displayHexColor.replace("#", "");

        let embed = new MessageEmbed()
            .setAuthor(guild_member.user.tag, guild_member.user.avatarURL())
            .setDescription(`[128px](${avatar_128}) - [256px](${avatar_256}) - [512px](${avatar_512}) - [1024px](${avatar_1024})`)
            .setImage(avatar_1024)
            .setColor(accent_color);

        if (message.author.id == guild_member.user.id)
            embed.setFooter(footers_me[Math.floor(Math.random() * footers_me.length)]);
        else
            embed.setFooter(footers[Math.floor(Math.random() * footers.length)]);
            
        message.channel.send({ embeds: [embed] });
    }
}