// A simple ping command.

require('dotenv').config();

const { MessageEmbed } = require('discord.js');
const { embedColor } = require('../../configs/clientSettings.json');

const cmdName = "ping";
const aliases = [];

const description = "Shows the bot's current latency.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message) => {
        let embed = new MessageEmbed()
            .setTitle("Pong!")
            .setColor(embedColor.MAIN);

        return await message.channel.send({ embeds: [embed] }).then(async msg => {
            let botMS = client.ws.ping;
            let commandMS = msg.createdTimestamp - message.createdTimestamp;

            embed.setDescription(`Bot: ${formatNumberString(botMS)}ms\nMessages: ${formatNumberString(commandMS)}ms`)
                .setColor(botMS > 999 ? embedColor.ERROR : embedColor.MAIN);

            if (process.env.DEVMODE)
                embed.setFooter({ text: "i'm merely a test bot - what do you expect from me?" });

            return await msg.edit({ embeds: [embed] }).then(async m => { if (botMS > 999) return await m.react("🇫") });
        });
    }
}

// >> Custom Functions
function formatNumberString(str) {
    return str.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}