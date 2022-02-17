// A group of commands related to channel moderation

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

const { embedColor } = require('../../configs/clientSettings.json');

module.exports = {
    requireGuildMemberHaveAdmin: true,
    specialPermissions: [Permissions.FLAGS.MANAGE_CHANNELS],

    data: new SlashCommandBuilder()
        .setName("channel")
        .setDescription("A group of commands related to channel moderation.")

        // Disables the SEND_MESSAGES permission in a channel for either @everyone or a certain role.
        .addSubcommand(subcommand => subcommand.setName("lock")
            .setDescription("Disable the SEND_MESSAGES permission in a channel for either @everyone or a certain role.")
            .addChannelOption(option => option.setName("channel").setDescription("The channel to lock"))
            .addRoleOption(option => option.setName("role").setDescription("Revoke the SEND_MESSAGES permission for a specific role")))

        // Enables the SEND_MESSAGE permission in a channel for either @everyone or a certain role.
        .addSubcommand(subcommand => subcommand.setName("unlock")
            .setDescription("Enable the SEND_MESSAGES permission in a channel for either @everyone or a certain role.")
            .addChannelOption(option => option.setName("channel").setDescription("The channel to unlock"))
            .addRoleOption(option => option.setName("role").setDescription("Revoke the SEND_MESSAGES permission for a specific role"))),

    execute: async (client, interaction) => {
        switch (interaction.options.getSubcommand()) {
            // Disables the SEND_MESSAGES permission in a channel for either @everyone or a certain role.
            case "lock":
                return await LockUnlockChannel(interaction, true);

            // Enables the SEND_MESSAGE permission in a channel for either @everyone or a certain role.
            case "unlock":
                return await LockUnlockChannel(interaction, false);
        }
    }
}

// >> Custom Functions
async function LockUnlockChannel(interaction, lock) {
    let channel = interaction.options.getChannel("channel") || interaction.channel;
    let role = interaction.options.getRole("role") || interaction.guild.roles.everyone;

    try {
        // Try changing the (SEND_MESSAGES) permission for the specified channel and role
        await channel.permissionOverwrites.edit(role, { SEND_MESSAGES: lock });

        // Create an embed to show our success
        let embed = new MessageEmbed()
            .setDescription(`🔒 ${channel} has been **${lock ? "locked" : "unlocked"}** for ${role}`)
            .setColor(lock ? embedColor.ERROR : embedColor.MAIN);

        // Send the success embed saying the channel has been locked/unlocked
        return await interaction.reply({ embeds: [embed] });
    } catch {
        // Formatted strings for cleaner embed creation below
        let failedReply = `Failed to ${lock ? "lock" : "unlock"} channel $CHANNEL for role $ROLE`
            .replace("$CHANNEL", channel.fetch() ? channel : "\`missing_channel\`")
            .replace("$ROLE", role.fetch() ? role : "\`missing_role\`");

        // Create an embed to show the fact we absolutely suck at life and couldn't go through with the command
        let embed = new MessageEmbed()
            .setDescription(failedReply)
            .setColor(embedColor.ERROR);

        // Send off our failure to the user
        return await interaction.reply({ embeds: [embed] });
    }
}