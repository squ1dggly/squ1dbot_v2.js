// Sets the bot's status after it connects to Discord.

require('dotenv').config();
const clientSettings = require('../../configs/clientSettings.json');

module.exports = {
    name: "Set Bot Status",
    event: "Ready",

    execute: async (client) => {
        let activity = process.env.DEVMODE ? clientSettings.CLIENT_ACTIVITY_DEVMODE : clientSettings.CLIENT_ACTIVITY;

        client.user.setStatus(activity.STATUS);
        client.user.setActivity(activity.INFO, { type: activity.TYPE });
    }
}