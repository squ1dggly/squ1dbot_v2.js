// Display a server member's avatar.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { RandomChoice } = require('../../modules/jsTools');
const { AVATAR } = require('../../configs/commandMessages.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Display a server member's avatar")

        .addUserOption(option => option.setName("member")
            .setDescription("The member you want to check out."))

        .addBooleanOption(option => option.setName("ephemeral")
            .setDescription("If set to true only you will be able to see this message.")),

    execute: async (client, interaction) => {
        let guildMember = interaction.options.getString("member") || interaction.member;
        let ephemeral = interaction.options.getBoolean("ephemeral") || false;

        let avatar_128 = guildMember.user.displayAvatarURL({ dynamic: true, size: 128 });
        let avatar_256 = guildMember.user.displayAvatarURL({ dynamic: true, size: 256 });
        let avatar_512 = guildMember.user.displayAvatarURL({ dynamic: true, size: 512 });
        let avatar_1024 = guildMember.user.displayAvatarURL({ dynamic: true, size: 1024 });

        let embedAccentColor = await interaction.guild.members.fetch(guildMember.id).displayHexColor.replace("#", "");
        let displayingSelf = interaction.member.id === guildMember.user.id;

        let embed = new MessageEmbed()
            .setAuthor({ name: guildMember.displayName, url: guildMember.user.avatarURL() })
            .setDescription(`[128px](${avatar_128}) - [256px](${avatar_256}) - [512px](${avatar_512}) - [1024px](${avatar_1024})`)
            .setImage(avatar_1024)
            .setFooter({ text: displayingSelf ? RandomChoice(AVATAR.me) : RandomChoice(AVATAR.other) })
            .setColor(embedAccentColor);

        interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    }
}