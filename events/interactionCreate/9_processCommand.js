// Processes interaction commands.

const clientSettings = require('../../configs/clientSettings.json');

module.exports = {
    name: "Process Command",
    event: "interactionCreate",

    execute: async (client, interaction, guild_data) => {
        if (!interaction.isCommand()) return;

        let cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) return;

        try {
            if (cmd.isAdminCommand) {
                // Checks if the bot has admin perms:
                if (!interaction.guild.me.permissions.has("ADMINISTRATOR"))
                    return interaction.reply("I don't have permission to execute this command. Give me admin when?");

                // Check if the user that called the interaction is either an (admin) or the (bot creator):
                if (!interaction.member.permissions.has("ADMINISTRATOR"))
                    if (!interaction.user.id != clientSettings.CREATOR_ID) {
                        let responses = clientSettings.ERRORMSG_NOADMINPERMS;
                        return interaction.reply({ content: responses[Math.floor(Math.random() * responses.length)], ephemeral: true });
                    }
                }
            
            cmd.execute(client, interaction, guild_data);
        }
        catch (err) { console.error(`Failed to execute slash command \"${cmd.data.name}\"`, err); }
    }
}