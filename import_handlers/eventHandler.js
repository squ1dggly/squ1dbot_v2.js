// Imports our event scripts and binds them to their intended event triggers.

const fs = require('fs');
const mongo = require('../modules/mongo');

module.exports = {
    getGuildData: getGuildData,
    
    init: (client) => {
        let event_ready = importEventFunctions('../events/ready');

        let event_guildCreate = importEventFunctions('../events/guildCreate');
        let event_guildDelete = importEventFunctions('../events/guildDelete');
        // let event_guildMemberAdd = importEventFunctions('../events/guildMemberAdd');

        let event_messageCreate = importEventFunctions('../events/messageCreate');
        let event_messageUpdate = importEventFunctions('../events/messageUpdate');
        // let event_messageDelete = importEventFunctions('../events/messageDelete');

        let event_interactionCreate = importEventFunctions('../events/interactionCreate');

        // Ready
        client.on("ready", async () => {
            event_ready.forEach(func => executeEvent(func, client));
        });

        // Guild Create
        client.on("guildCreate", async (guild) => {
            getGuildData(client, guild).then(guildData => {
                event_guildCreate.forEach(func => executeEvent(func, client, guild, guildData));
            });
        });

        // Guild Create
        client.on("guildDelete", async (guild) => {
            getGuildData(client, guild).then(guildData => {
                event_guildDelete.forEach(func => executeEvent(func, client, guild, guildData));
            });
        });

        // Guild Member Add
        /* client.on("guildMemberAdd", async (guild_member) => {
            getGuildData(client, guild_member.guild).then(guildData => {
                event_guildMemberAdd.forEach(func => executeEvent(func, client, guild_member, guildData));
            });
        }); */

        // Message Create
        client.on("messageCreate", async (message) => {
            getGuildData(client, message.guild).then(guildData => {
                event_messageCreate.forEach(func => executeEvent(func, client, message, guildData));
            });
        });

        // Message Update
        client.on("messageUpdate", async (before, after) => {
            let message = { before: before, after: after };

            getGuildData(client, message.after.guild).then(guildData => {
                event_messageUpdate.forEach(func => executeEvent(func, client, message, guildData));
            });
        });

        // Message Delete
        /* client.on("messageDelete", async (message) => {
            getGuildData(client, message.guild).then(guildData => {
                event_messageDelete.forEach(func => executeEvent(func, client, message, guildData));
            });
        }); */

        // Interaction Create
        client.on("interactionCreate", async (interaction) => {
            getGuildData(client, interaction.guild).then(guildData => {
                event_interactionCreate.forEach(func => executeEvent(func, client, interaction, guildData));
            });
        });
    }
}

// >> Custom Functions
function importEventFunctions(dir) {
    let files = fs.readdirSync(dir.substring(1)).filter(fn => fn.endsWith('.js'));
    let funcs = [];

    files.forEach(fn => funcs.push(require(`${dir}/${fn}`)));
    return funcs;
}

async function getGuildData(client, guild) {
    let guildData;

    if (guild)
        if (await mongo.checkGuildExists(guild.id))
            guildData = await mongo.getGuild(guild.id);
        else
            guildData = await mongo.insertNewGuild(guild.id, guild, client);

    return guildData;
}

function executeEvent(func, ...args ) {
    try {
        func.execute.apply(null, args);
    } catch (err) {
        console.error(`Failed to execute event function \"${func.name}\" on event \"${func.event}\"`, err);
    }
}