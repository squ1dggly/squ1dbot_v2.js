// Ban a member of the server.

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    isAdminCommand: true,

    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a member of the server.")
        .addUserOption(option => option.setName("member").setDescription("The member you would like to ban"))
        .addStringOption(option => option.setName("member-id").setDescription("The member you would like to ban using their id"))
        .addStringOption(option => option.setName("reason").setDescription("The reason for the ban"))
        .addBooleanOption(option => option.setName("purge").setDescription("Purge a week's worth of messages from this member after ban")),

    execute: async (client, interaction) => {
        const member = interaction.options.getUser("member");
        const member_id = interaction.options.getString("member-id");
        const reason = interaction.options.getString("reason") || "n/a";
        const purge = interaction.options.getBoolean("purge") || false;

        let guild_member;

        if (member)
            guild_member = await interaction.guild.members.fetch(member.fetch());
        else if (member_id)
            try { guild_member = await interaction.guild.members.fetch(member_id); }
            catch { return interaction.reply({ content: "Could not find member using the provided id.", ephemeral: true }); }
        else
            return interaction.reply({ content: "You didn't specify who you wanted to ban.", ephemeral: true });

        // Permission Checks:
        // Checks if the target was the guild owner:
        if (guild_member.id == interaction.guild.ownerId)
            return interaction.reply("Imagine trying to ban the server owner.");

        // Checks if the target was ourself:
        if (guild_member.id == client.user.id)
            return interaction.reply("You cannot ban me you mortal, human!");

        // Checks if the target was themself:
        if (guild_member.id == interaction.user.id)
            return interaction.reply("You can't kick yourself...");

        // Checks if the target is a server administrator:
        if (guild_member.permissions.has("ADMINISTRATOR"))
            return interaction.reply("You can't ban a server admin, idiot.");

        // Checks if they have a higher or equal role than their target:
        if (guild_member.roles.highest.position >= interaction.member.roles.highest.position)
            return interaction.reply("You are to *weak* to ban this member.");

        // Checks if the bot has a higher or equal role than the target:
        if (guild_member.roles.highest.position >= interaction.guild.me.roles.highest.position)
            return interaction.reply("I don't have enough high ground to ban the member.");

        // Ban the member:
        try {
            guild_member.ban({ days: (purge) ? 7 : 0, reason: reason });

            return interaction.reply(`**${guild_member.user.tag}** has been struck by the ban hammer!\nReason: ${reason}`);
        } catch {
            return interaction.reply({ content: "Failed to ban member from the server.", ephemeral: true });
        }
    }
}