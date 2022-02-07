// A simple command that will display the link to which you can invite the bot to another server.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

const { INVITE_LINK } = require('../../configs/clientSettings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Invite the bot to another server."),

    execute: async (client, interaction) => {
        let action_row = new MessageActionRow().addComponents(
            new MessageButton({ label: "INVITE", style: "LINK", url: INVITE_LINK }));

        return await interaction.editReply({ content: `Invite me to your fiesta! Drinks are on me! 🍻`, components: [action_row] });
    }
}