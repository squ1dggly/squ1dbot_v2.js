// Displays the bot's invite link.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

const clientSettings = require('../../configs/clientSettings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Invite the bot to your server!"),

    execute: async (client, interaction) => {
        let action_row = new MessageActionRow().addComponents(
            new MessageButton({ label: "INVITE", style: "LINK", url: clientSettings.INVITE_LINK }));

        interaction.reply({ content: `Invite me to your fiesta! Drinks are on me! 🍻`, components: [action_row] });
    }
}