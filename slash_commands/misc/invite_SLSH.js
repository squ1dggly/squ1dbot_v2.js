// A simple command that will display the link to which you can invite the bot to another server.

require('dotenv').config();

const { SlashCommandBuilder } = require('@discordjs/builders');

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { RandomChoice } = require('../../modules/jsTools');

const { INVITE } = require('../../configs/commandMessages.json');
const { INVITE_LINK, embedColor } = require('../../configs/clientSettings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Invite the bot to another server."),

    execute: async (client, interaction) => {
        let inviteTitle = `***${interaction.member.displayName} used invite!*** It was very effective.`;
        let inviteTitle_devMode = `***${interaction.member.displayName} used invite!*** It wasn't very effective.`;

        let inviteDescription = RandomChoice(INVITE);
        let inviteDescription_devMode = "I'm just a test bot. You can't invite me.";

        let embed = new MessageEmbed()
            .setTitle(process.env.DEVMODE ? inviteTitle_devMode : inviteTitle)
            .setDescription(process.env.DEVMODE ? inviteDescription_devMode : inviteDescription)
            .setColor(embedColor.MAIN);

        let action_row = new MessageActionRow().addComponents(
            new MessageButton({ label: process.env.DEVMODE ? "INVITE PRODUCTION" : "INVITE", style: "LINK", url: INVITE_LINK }));

        return await interaction.reply({ embeds: [embed], components: [action_row] });
    }
}