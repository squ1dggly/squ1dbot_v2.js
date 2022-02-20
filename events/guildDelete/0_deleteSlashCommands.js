// Delete the bot's slash commands from the guild when the bot leaves

const { DeleteSlashCommands } = require('../../modules/slshCmdHandler');

module.exports = {
    name: "Delete Slash Commands",
    event: "guildDelete",

    execute: async (client, guild) => {
        await DeleteSlashCommands(client, guild);
    }
}