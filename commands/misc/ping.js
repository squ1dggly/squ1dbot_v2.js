// A simple ping command.

const cmdName = "ping";
const aliases = [];

const description = "Shows the bot's current latency.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message) => {
        let pongedMessage = await message.channel.send(`**Pong!**`);

        let botMS = client.ws.ping;
        let commandMS = pongedMessage.createdTimestamp - message.createdTimestamp;

        pongedMessage.edit(`**Pong!**\nBot: ${formatNumberString(botMS)}ms\nMessage: ${formatNumberString(commandMS)}ms`);
    }
}

function formatNumberString(str) {
    return str.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}