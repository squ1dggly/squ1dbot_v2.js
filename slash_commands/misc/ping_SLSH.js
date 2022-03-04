// A simple ping command.

require('dotenv').config();

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { embedColor } = require('../../configs/clientSettings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows the bot's current latency."),

    execute: async (client, interaction) => {
        let embed = new MessageEmbed()
            .setTitle("Pong!")
            .setColor(embedColor.MAIN);

        return await interaction.reply({ embeds: [embed] }).then(async i => {
            i = await interaction.fetchReply();

            let botMS = client.ws.ping;
            let commandMS = i.createdTimestamp - interaction.createdTimestamp;

            embed.setDescription(`Bot: ${formatNumberString(botMS)}ms\nInteractions: ${formatNumberString(commandMS)}ms`)
                .setColor(botMS > 999 ? embedColor.ERROR : embedColor.MAIN);

            if (process.env.DEVMODE)
                embed.setFooter({ text: "i'm merely a test bot - what do you expect from me?" });

            return await interaction.editReply({ embeds: [embed] }).then(async m => { if (botMS > 999) return await m.react("🇫") });
        });
    }
}

// >> Custom Functions
function formatNumberString(str) {
    return str.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}