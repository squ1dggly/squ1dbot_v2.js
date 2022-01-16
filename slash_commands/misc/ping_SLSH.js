// Displays the bot's ping with our connection to Discord.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const clientSettings = require('../../configs/clientSettings.json');

const formatNumberString = (num) => {
    return num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with the bot's current ping."),

    execute: async (client, interaction) => {
        const bot_ms = Math.round(client.ws.ping);

        const color_error = clientSettings.embedColor.ERROR;
        const color_approved = clientSettings.embedColor.APPROVED;

        // Create the embed to reply with:
        const embed = new MessageEmbed()
            .setDescription(formatNumberString(`**Pong!** ${bot_ms}ms`))
            .setColor((bot_ms > 999) ? color_error : color_approved);

        interaction.reply({ embeds: [embed] });
    }
}