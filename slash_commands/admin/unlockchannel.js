// Enables the (send message) permission from the (@everyone) role in a channel.

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    isAdminCommand: true,

    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Unlock the channel and let the permless peasants run free.")
        .addChannelOption(option => option.setName("channel").setDescription("The channel to lock"))
        .addRoleOption(option => option.setName("role").setDescription("Lock the channel for a specific role")),

    execute: async (client, interaction) => {
        const channel = interaction.options.getChannel("channel") || interaction.channel;
        const role = interaction.options.getRole("role") || interaction.guild.roles.everyone;

        channel.permissionOverwrites.edit(role, { SEND_MESSAGES: true });
        
        if (role.id == interaction.guild.roles.everyone.id)
            interaction.reply(`:unlock: ${channel} has been **unlocked**.`);
        else
            interaction.reply(`:unlock: ${channel} has been **unlocked** for role \`${role.name}\`.`);
    }
}