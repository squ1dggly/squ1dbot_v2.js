// A simple command that will display the link to which you can invite the bot to another server.

const { MessageActionRow, MessageButton } = require('discord.js');
const { INVITE_LINK } = require('../../configs/clientSettings.json');

const cmdName = "invite";
const aliases = [];

const description = "Invite the bot to another server.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message) => {
        let action_row = new MessageActionRow().addComponents(
            new MessageButton({ label: "INVITE", style: "LINK", url: INVITE_LINK }));

        message.channel.send({ content: `Invite me to your fiesta! Drinks are on me! 🍻`, components: [action_row] });
    }
}