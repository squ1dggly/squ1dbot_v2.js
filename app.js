// Initializes the bot and gets everything up and running.

// A very advanced Discord bot powered by an A.S.S (Artificial Stupidity System) system.
// Created and maintained by (squ1d) very original name, I know.

require('dotenv').config();
const fs = require('fs');

const { Client, Intents, Collection } = require('discord.js');
const { PushSlashCommands, DeleteSlashCommands } = require('./modules/slshCmdHandler');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.DIRECT_MESSAGES
    ],

    partials: ["CHANNEL"] // Allows the bot to read its own DMs
});

client.commands = new Collection();
client.commandAliases = new Collection();
client.slashCommands = new Collection();

client.messageSpamCache = new Collection();
client.channelErrorMsgCache = new Collection();
client.cmdCooldownCache = new Collection();

// Run handlers:
console.log("starting...")
let importHandler_dir = fs.readdirSync('./import_handlers').filter(fn => fn.endsWith('.js'));

importHandler_dir.forEach(fn => {
    try { require(`./import_handlers/${fn}`).init(client); }
    catch (err) { console.error(`Failed to initialize handler; ${fn} is not a valid handler script`, err); }
});

// Connect to our client using our token:
console.log("connecting to discord...");

client.login(process.env.TOKEN).then(async () => {
    // await PushSlashCommands(client);
    // await DeleteSlashCommands(client);
});