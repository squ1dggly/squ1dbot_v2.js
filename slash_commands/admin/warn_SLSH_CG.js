// A group of commands related to guild member warns

const { SlashCommandBuilder } = require('@discordjs/builders');
const { publishUserWarn, removeUserWarn, validateUserWarn } = require('../../modules/mongo');

module.exports = {
    requireGuildMemberHaveAdmin: true,

    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("A group of commands related to guild member warns.")

        // Warn a naughty member of the server.
        .addSubcommand(subcommand => subcommand.setName("member")
            .setDescription("Warn a naughty member of the server.")
            .addUserOption(option => option.setName("member")
                .setDescription("The member you want to warn.")
                .setRequired(true)))

        // Remove a warn from said used-to-be naughty member of the server
        .addSubcommand(subcommand => subcommand.setName("remove")
            .setDescription("Remove a warn from a used-to-be naughty member of the server.")
            .addStringOption(option => option.setName("warn-id")
                .setDescription("The ID of the warn you want to remove.")
                .setRequired(true))),

    execute: async (client, interaction) => {
        switch (interaction.options.getSubcommand()) {
            // Warn a naughty member of the server.
            case "user":
                return await WarnMember(interaction);

            // Remove a warn from said used-to-be naughty member of the server
            case "remove":
                return await RemoveMemberWarn(interaction);
        }
    }
}

// >> Custom Functions
async function WarnMember(interaction) {
    let guildMember = interaction.options.getUser("member");
    let reason = interaction.options.getString("reason") || "Not provided.";

    // Publish the user warn to our mongo database
    return await publishUserWarn(interaction.guild.id, guildMember.id, reason, interaction.createdTimestamp).then(async warn => {
        return await interaction.editReply({ content: `Warn published for ${guildMember.user}\n**Reason:** \"${warn.data.reason}\"` });
    }).catch(async err => {
        return await interaction.editReply({ content: `Failed to submit warn to user ${guildMember.user.tag}` });
    });
}

async function RemoveMemberWarn(interaction) {
    let warnID = interaction.options.getUser("warn-id");

    // Checks if the gived ID was a valid warn id in the current guild
    if (await !validateUserWarn(message.guild.id, warnID)) return await interaction.editReply({
        content: "The warn ID you provided is invalid."
    });

    // If all checks passed then remove the warn from our mongo database
    return await removeUserWarn(interaction.guild.id, warnID).then(async removedWarn => {
        return await interaction.guild.members.fetch(removedWarn.userID).then(async guildMember => {
            // If the member was found in the guild at the time of this command show their username
            return await interaction.editReply({ content: `Removed warn from user **${guildMember.user.tag}**` });
        }).catch(async err => {
            // If the member wasn't found in the guild just let the user know that the warn was removed
            return await interaction.editReply({ content: "Warn removed." });
        });
    }).catch(async err => {
        // If removing the warn was unsuccessful
        return await interaction.editReply({ content: `Failed to remove warn \`${warnID}\`.` });
    });
}