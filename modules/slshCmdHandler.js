const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

async function PushSlashCommands(guild = null) {
    try {
        let rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
        let commands = [];

        client.slashCommands.forEach(cmd => commands.push(cmd.data));

        if (guild.id)
            rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: commands })
                .then(() => console.log(`pushed slash commands to guild: \"${guild.name}\" - (${guild.id})`))
                .catch(console.error);
        else {
            let guilds = await client.guilds.fetch();

            guilds.forEach(g => {
                rest.put(Routes.applicationGuildCommands(client.user.id, g.id), { body: commands })
                    .then(() => console.log(`pushed slash commands to guild: \"${g.name}\" - (${g.id})`))
                    .catch(console.error);
            });
        }
    } catch (err) {
        console.error(`Failed to push slash commands to guilds`, err);
    }
}

async function DeleteSlashCommands(guild = null) {
    try {
        if (guild.id)
            client.guilds.cache.get(guild.id).commands.fetch()
                .then(slsh_cmds => slsh_cmds.forEach(cmd => cmd.delete()));
        else {
            let guilds = await client.guilds.fetch();

            guilds.forEach(guild => {
                client.guilds.cache.get(guild.id).commands.fetch()
                    .then(slsh_cmds => slsh_cmds.forEach(cmd => cmd.delete()));

                console.log(`removed slash commands from guild: \"${guild.name}\" - (${guild.id})`);
            });
        }
    } catch (err) {
        console.error(`Failed to remove slash commands from guilds`, err);
    }
}

module.exports = {
    PushSlashCommands: PushSlashCommands,
    DeleteSlashCommands: DeleteSlashCommands
}