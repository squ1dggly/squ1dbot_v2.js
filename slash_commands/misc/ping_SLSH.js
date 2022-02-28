// A simple ping command.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { embedColor } = require('../../configs/clientSettings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows the bot's current latency."),

    execute: async (client, interaction) => {
        let botMS = client.ws.ping;
        let embed = new MessageEmbed()
            .setTitle(`${client.devMode ? " **Pong! - currently in dev mode; stability does not exist.**" : "**Pong!**"}\nBot: ${formatNumberString(botMS)}ms`)
            .setColor((botMS > 420) ? embedColor.ERROR : embedColor.MAIN);

        return await interaction.reply({ embeds: [embed] });
    }
}

// >> Custom Functions
function formatNumberString(str) {
    return str.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}