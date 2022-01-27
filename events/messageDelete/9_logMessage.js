// Log deleted messages and send them to the guild's audit log channel if it's set.

const { LogMessageDelete } = require('../../modules/auditLogger');

module.exports = {
    name: "Log Message",
    event: "messageDelete",

    execute: async (client, message, guild_data) => {
        if (message.author.id == client.user.id) return;
        if (message.author.bot) return;

        // LogMessageDelete(client, message, guild_data);
    }
}