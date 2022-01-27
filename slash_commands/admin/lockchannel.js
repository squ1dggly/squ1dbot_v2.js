// Disables the (send message) permission from the (@everyone) role in a channel.

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    isAdminCommand: true,

    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Lock the channel away from permless peasants.")
        .addChannelOption(option => option.setName("channel").setDescription("The channel to lock"))
        .addRoleOption(option => option.setName("role").setDescription("Lock the channel for a specific role")),

    execute: async (client, interaction) => {
        const channel = interaction.options.getChannel("channel") || interaction.channel;
        const role = interaction.options.getRole("role") || interaction.guild.roles.everyone;

        channel.permissionOverwrites.edit(role, { SEND_MESSAGES: false });

        if (role.id == interaction.guild.roles.everyone.id)
            interaction.reply(`:lock: ${channel} has been **locked**.`);
        else
            interaction.reply(`:lock: ${channel} has been **locked** for role \`${role.name}\`.`);
    }
}