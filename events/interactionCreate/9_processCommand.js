// Processes interaction commands.

const { Permissions } = require('discord.js');

const { clientPermissionsUnavailable_ES } = require('../../embed_styles/guildInfoStyles');
const { TestForPermissions } = require('../../modules/guildTools');
const { RandomChoice } = require('../../modules/jsTools');

const { errorMsg } = require('../../configs/clientSettings.json');

module.exports = {
    name: "Process Command",
    event: "interactionCreate",

    execute: async (client, interaction, guildData) => {
        // If the interaction received wasn't actually a command cancel the remaining functions in this script
        if (!interaction.isCommand()) return;
        // await interaction.deferReply();

        // Gets the appropriate command if it exists
        let command = client.slashCommands.get(interaction.commandName);

        if (command) {
            try {
                // If the command is an admin command
                // prevent the user from running the command if they themselves don't have administrative permission in the guild
                if (command.requireGuildMemberHaveAdmin) {
                    let specialPermissionTest = TestForPermissions(interaction.member.permissions, Permissions.FLAGS.ADMINISTRATOR);
                    if (!specialPermissionTest.passed)
                        return await interaction.reply({
                            content: RandomChoice(errorMsg.NOTGUILDADMIN),
                            ephemeral: true
                        });
                }

                // Checks if we have the required permissions if the command uses anything special
                if (command.specialPermissions) {
                    let specialPermissionTest = TestForPermissions(interaction.guild.me.permissions, command.specialPermissions);
                    if (!specialPermissionTest.passed)
                        return await interaction.reply({ embeds: [clientPermissionsUnavailable_ES(specialPermissionTest.requiredPermissions)] });
                }

                // Now that that's out of the way... Let's actually run the command if we're able to
                command.execute(client, interaction, guildData);
            } catch (err) {
                console.error(`Failed to execute slash command \"${command.data.name}\"`, err);
                
                return await interaction.reply(RandomChoice(errorMsg.COMMANDFAILEDMISERABLY)
                    .replace("$CMDNAME", command.name)
                    .replace("$CREATORTAG", userMention(CREATOR_ID))
                );
            }
        }
    }
}