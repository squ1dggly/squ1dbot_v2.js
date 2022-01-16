const { Schema, model } = require('mongoose');

const guild_schema = Schema({
    _id: { type: String, require: true },
    
    guildName: { type: String, require: true },
    guildId: { type: Number, require: true },
    
    guildPrefixes: { type: Array, require: true },

    channels: { type: Map, default: new Map() },

    colorRoles: { type: Map, default: new Map() },

    warns: { type: Map, default: new Map() }
}, { collection: 'guilds' });

const guildModel = model('guilds', guild_schema);
module.exports = guildModel;