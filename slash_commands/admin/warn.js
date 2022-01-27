// Warn a naughty member of the server.

const { SlashCommandBuilder } = require('@discordjs/builders');

const mongo = require('../../modules/mongo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a naughty member of the server.")
        .addUserOption(option => option.setName("user").setDescription("The user you want to warn"))
        .addStringOption(option => option.setName("user-id").setDescription("The user you want to warn using their id"))
        .addStringOption(option => option.setName("reason").setDescription("The reason you're warning this user")),

    execute: async (client, interaction) => {
        const user = interaction.options.getUser("user");
        const user_id = interaction.options.getString("user-id");
        const reason = interaction.options.getString("reason") || "n/a";

        let guild_member;

        if (user) guild_member = await interaction.guild.members.fetch(user.id);
        else if (user_id) guild_member = await interaction.guild.members.fetch(user_id);
        else return interaction.reply({ content: "You must specify who you want to warn.", ephemeral: true });

        warnUser(client, interaction, guild_member.user, reason);
    }
}

function warnUser(client, interaction, user, reason) {
    try {
        mongo.publishUserWarn(interaction.guild.id, user.id, reason, interaction.createdAt);
        interaction.reply(`Warn published for ${user}\n**Reason:** \"${reason}\"`);
    } catch (err) {
        interaction.reply({ content: "Failed to publish warn.", ephemeral: true });
    }
}