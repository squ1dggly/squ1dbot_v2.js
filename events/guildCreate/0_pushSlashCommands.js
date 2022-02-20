// Push the bot's slash commands to the new guild

const { PushSlashCommands } = require('../../modules/slshCmdHandler');

module.exports = {
    name: "Push Slash Commands",
    event: "guildCreate",

    execute: async (client, guild) => {
        await PushSlashCommands(guild);
    }
}