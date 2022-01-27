// Sets the bot's status after it connects to Discord.

const clientSettings = require('../../configs/clientSettings.json');

module.exports = {
    name: "Set Bot Status",
    event: "Ready",

    execute: async (client) => {
        let activity = clientSettings.CLIENT_ACTIVITY;

        client.user.setStatus(activity.STATUS);
        client.user.setActivity(activity.INFO, { type: activity.TYPE });
    }
}