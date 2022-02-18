// Connects us to our Mongo database so we can save and retrieve data.

const { time, userMention, memberNicknameMention } = require('@discordjs/builders');

const mongoose = require('mongoose');
const URI = process.env.MONGO_URI;

// Models
const guildModel = require('../models/guildModel');

// Connect to Mongo
mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("successfully connected to mongo"))
    .catch((err) => console.error("Failed to connect to Mongo:", err));

// Module
module.exports = {
    // Guilds:
    checkGuildExists: async (guild_id) => { return await guildModel.exists({ _id: guild_id }); },

    getGuild: async (guild_id) => { return await guildModel.findById(guild_id); },

    updateGuild: async (guild_id, query) => { return await guildModel.findByIdAndUpdate(guild_id, query); },

    insertNewGuild: async (guild_id, guild, client) => {
        let new_guild = await new guildModel({
            _id: guild_id,

            guildName: guild.name,
            guildId: guild_id,

            guildPrefixes: ["s!",
                `${userMention(client.user.id)} `,
                `${memberNicknameMention(client.user.id)} `
            ]
        });

        return await new_guild.save();
    },

    // Guild Users:
    publishUserWarn: async (guild_id, user_id, reason, timestamp) => {
        let guild_data = await guildModel.findById(guild_id);

        let warn = createWarn(guild_data.warns, user_id, reason, timestamp);
        guild_data.warns.set(warn.id, warn.data);

        await guildModel.findByIdAndUpdate(guild_id, { warns: guild_data.warns });
        return warn;
    },

    removeUserWarn: async (guild_id, warn_id) => {
        let guild_data = await guildModel.findById(guild_id);

        let removed_warn = guild_data.warns.get(warn_id);
        if (!removed_warn) return null;

        guild_data.warns.delete(warn_id);

        await guildModel.findByIdAndUpdate(guild_id, { warns: guild_data.warns });
        return removed_warn;
    },

    validateUserWarn: async (guild_id, warn_id) => {
        let guild_data = await guildModel.findById(guild_id);
        return (guild_data.warns.get(warn_id)) ? true : false;
    },

    retrieveUserWarns: async (guild_id, user_id) => {
        let guild_data = await guildModel.findById(guild_id);
        let warns = [];

        guild_data.warns.forEach(warn => { if (warn.userID == user_id) warns.push(warn) });
        return warns;
    }
}

// Warn creation helper functions:
function generateWarnId() {
    let id_length = 5;
    let id = "";

    for (let i = 0; i < id_length; i++)
        id += `${Math.floor(Math.random() * 9)}`;

    return id;
}

function createWarn(guild_warns, user_id, reason, timestamp) {
    let warn_id = generateWarnId();
    while (guild_warns.get(warn_id)) warn_id = generateWarnId();

    return {
        id: warn_id,

        data: {
            id: warn_id,
            userID: user_id,

            timestamp: timestamp,
            reason: reason,

            formatted: `**Id**: ${warn_id}\n**Timestamp**: ${time(timestamp, "d")}\n**Reason**: \"${reason}\"`
        }
    };
}