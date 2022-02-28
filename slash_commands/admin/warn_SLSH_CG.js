// A group of commands related to guild member warns

const { SlashCommandBuilder } = require('@discordjs/builders');
const { publishUserWarn, removeUserWarn, validateUserWarn, retrieveUserWarns } = require('../../modules/mongo');

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
                .setRequired(true))

            .addStringOption(option => option.setName("reason")
                .setDescription("The reason you're warning them.")))

        // Remove a warn from said used-to-be naughty member of the server
        .addSubcommand(subcommand => subcommand.setName("remove")
            .setDescription("Remove a warn from a used-to-be naughty member of the server.")
            .addStringOption(option => option.setName("warn-id")
                .setDescription("The ID of the warn you want to remove.")
                .setRequired(true)))

        // Fetch the guild member's warns in the current server
        .addSubcommand(subcommand => subcommand.setName("view")
            .setDescription("Fetch the guild member's warns in the current server.")
            .addUserOption(option => option.setName("member")
                .setDescription("The member that you want to view information on.")
                .setRequired(true))),

    execute: async (client, interaction) => {
        switch (interaction.options.getSubcommand()) {
            // Warn a naughty member of the server.
            case "user":
                return await WarnMember(interaction);

            // Remove a warn from said used-to-be naughty member of the server
            case "remove":
                return await RemoveMemberWarn(interaction);

            // Fetch the guild member's warns in the current server
            case "view":
                return await GetMemberWarnList(interaction);
        }
    }
}

// >> Custom Functions
async function WarnMember(interaction) {
    let guildMember = interaction.options.getUser("member");
    let reason = interaction.options.getString("reason") || "Not provided.";

    // Publish the user warn to our mongo database
    return await publishUserWarn(interaction.guild.id, guildMember.id, reason, interaction.createdAt).then(async warn => {
        return await interaction.reply({
            content: `Warn published for ${guildMember.user} **id:** ${warn.id}\n**Reason:** \"${warn.data.reason}\"`
        });
    }).catch(async err => {
        console.error(err);

        return await interaction.reply({
            content: `Failed to submit warn to user ${guildMember.user.tag}`,
            ephemeral: true
        });
    });
}

async function RemoveMemberWarn(interaction) {
    let warnID = interaction.options.getString("warn-id");

    // Checks if the gived ID was a valid warn id in the current guild
    let vaildated = await validateUserWarn(interaction.guild.id, warnID);
    if (!vaildated) return await interaction.reply({
        content: "The warn ID you provided is invalid.",
        ephemeral: true
    });

    // If all checks passed then remove the warn from our mongo database
    return await removeUserWarn(interaction.guild.id, warnID).then(async removedWarn => {
        return await interaction.guild.members.fetch(removedWarn.userID).then(async guildMember => {
            // If the member was found in the guild at the time of this command show their username
            return await interaction.reply({ content: `Removed warn from user **${guildMember.user.tag}**` });
        }).catch(async err => {
            // If the member wasn't found in the guild just let the user know that the warn was removed
            return await interaction.reply({ content: "Warn removed." });
        });
    }).catch(async err => {
        console.error(err);

        // If removing the warn was unsuccessful
        return await interaction.reply({
            content: `Failed to remove warn \`${warnID}\`.`,
            ephemeral: true
        });
    });
}

async function GetMemberWarnList(interaction) {
    let guildMember = interaction.options.getUser("member");

    return await retrieveUserWarns(interaction.guild.id, guildMember.id).then(async fetchedWarns => {
        let embed = memberWarns_ES(guildMember, fetchedWarns, 10);

        return await interaction.reply({ embeds: [embed] });
    });
}