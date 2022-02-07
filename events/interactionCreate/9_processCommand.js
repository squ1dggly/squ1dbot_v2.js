// Processes interaction commands.

const { Permissions } = require('discord.js');

const { errorMsg } = require('../../configs/clientSettings.json');
const { TestForPermissions } = require('../../modules/guildPermissionTools');
const { clientPermissionsUnavailable_ES } = require('../../embed_styles/guildInfoStyles');

module.exports = {
    name: "Process Command",
    event: "interactionCreate",

    execute: async (client, interaction, guildData) => {
        // If the interaction received wasn't actually a command cancel the remaining functions in this script
        if (!interaction.isCommand()) return;
        interaction.deferReply(); // QUESTION: (deferReply) or (deferUpdate)?

        // Gets the appropriate command if it exists
        let command = client.slashCommands.get(interaction.commandName);

        if (command) {
            try {
                // If the command is an admin command
                // prevent the user from running the command if they themselves don't have administrative permission in the guild
                if (command.requireGuildMemberHaveAdmin) {
                    let specialPermissionTest = TestForPermissions(interaction.member.permissions, Permissions.FLAGS.ADMINISTRATOR);
                    if (!specialPermissionTest.passed)
                        return await interaction.editReply({
                            content: `Look who showed up with a knife to a gun fight.\nYou don't seem to have the \`${specialPermissionTest.requiredPermissions}\` permission. How do you expect to use this command?`,
                            ephemeral: true
                        });
                }

                // Checks if we have the required permissions if the command uses anything special
                if (command.specialPermissions) {
                    let specialPermissionTest = TestForPermissions(interaction.guild.me.permissions, command.specialPermissions);
                    if (!specialPermissionTest.passed)
                        return await interaction.editReply({ embeds: [clientPermissionsUnavailable_ES(specialPermissionTest.requiredPermissions)] });
                }

                // Now that that's out of the way... Let's actually run the command if we're able to
                command.execute(client, interaction, guildData);
            } catch (err) {
                console.error(`Failed to execute slash command \"${command.data.name}\"`, err);
                return await interaction.editReply(errorMsg.COMMANDFAILEDMISERABLY.replace("$CMDNAME", command.data.name));
            }
        }
    }
}