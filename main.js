// Initializes the bot and gets everything up and running.

// A very advanced Discord bot powered by an A.S.S (Artificial Stupidity System) system.
// Created and maintained by (squ1d) very original name, I know.

const fs = require('fs');

const { Client, Intents, Collection } = require('discord.js');

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

client.botToken = require('./configs/clientToken.json').TOKEN;

// Run handlers:
let importHandler_dir = fs.readdirSync('./import_handlers').filter(fn => fn.endsWith('.js'));

importHandler_dir.forEach(fn => {
    try { require(`./import_handlers/${fn}`).init(client); }
    catch (err) { console.error(`Failed to initialize handler: ${fn} is not a valid handler script`, err); }
});

// Slash command stuff:
/* client.on("ready", async () => {
    // DeleteSlashCommands();
    // PushSlashCommands();
}); */

// Logs into our Discord Bot using our token:
console.log("connecting to discord...");
client.login(client.botToken);

// Slash command handler:
async function DeleteSlashCommands() {
    try {
        let guilds = await client.guilds.fetch();

        guilds.forEach(guild => {
            client.guilds.cache.get(guild.id).commands.fetch()
                .then(slsh_cmds => slsh_cmds.forEach(cmd => cmd.delete()));

            console.log(`removed slash commands from guild: \"${guild.name}\" - (${guild.id})`);
        });
    } catch (err) {
        console.error(`Failed to remove slash commands from guilds`, err);
    }
}

async function PushSlashCommands() {
    try {
        const { REST } = require('@discordjs/rest');
        const { Routes } = require('discord-api-types/v9');

        let rest = new REST({ version: "9" }).setToken(client.botToken);
        
        let commands = [];
        client.slashCommands.forEach(cmd => commands.push(cmd.data));

        let guilds = await client.guilds.fetch();
    
        guilds.forEach(guild => {
            rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: commands })
                .then(() => console.log(`pushed slash commands to guild: \"${guild.name}\" - (${guild.id})`))
                .catch(console.error);
        });
    } catch (err) {
        console.error(`Failed to push slash commands to guilds`, err);
    }
}