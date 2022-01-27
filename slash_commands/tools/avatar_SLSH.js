// Display a server member's avatar.

const { SlashCommandBuilder } = require('@discordjs/builders');
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("View someone's or your own avatar.")
        .addUserOption(option => option.setName("user").setDescription("Choose someone in the server"))
        .addBooleanOption(option => option.setName("ephemeral").setDescription("If set to true only you will be able to see this message")),

    execute: async (client, interaction) => {
        let user = interaction.options.getUser("user");
        let ephemeral = interaction.options.getBoolean("ephemeral") || false;

        let guild_member = (user) ? await interaction.guild.members.fetch(user.id) : interaction.member;
        
        let avatar_128 = guild_member.user.displayAvatarURL({ dynamic: true, size: 128 });
        let avatar_256 = guild_member.user.displayAvatarURL({ dynamic: true, size: 256 });
        let avatar_512 = guild_member.user.displayAvatarURL({ dynamic: true, size: 512 });
        let avatar_1024 = guild_member.user.displayAvatarURL({ dynamic: true, size: 1024 });

        let accent_color = (await interaction.guild.members.fetch(guild_member.user.id)).displayHexColor.replace("#", "");

        let embed = new MessageEmbed()
            .setAuthor(guild_member.user.tag, guild_member.user.avatarURL())
            .setDescription(`[128px](${avatar_128}) - [256px](${avatar_256}) - [512px](${avatar_512}) - [1024px](${avatar_1024})`)
            .setImage(avatar_1024)
            .setColor(accent_color);

        if (interaction.user.id == guild_member.user.id)
            embed.setFooter(footers_me[Math.floor(Math.random() * footers_me.length)]);
        else
            embed.setFooter(footers[Math.floor(Math.random() * footers.length)]);
            
        interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    }
}