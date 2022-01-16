// Kicks a member from the guild.

const { SlashCommandBuilder } = require('@discordjs/builders');
const auditLogger = require('../../modules/auditLogger');

module.exports = {
    isAdminCommand: true,

    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a member from the server.")
        .addUserOption(option => option.setName("member").setDescription("The member you would like to kick"))
        .addStringOption(option => option.setName("member-id").setDescription("The member you would like to kick using their id"))
        .addStringOption(option => option.setName("reason").setDescription("The reason for the kick"))
        .addBooleanOption(option => option.setName("fake").setDescription("Fake the kick instead of actually kicking them")),

    execute: async (client, interaction) => {
        const member = interaction.options.getUser("member");
        const member_id = interaction.options.getString("member-id");
        const reason = interaction.options.getString("reason") || "n/a";
        const fake = interaction.options.getBoolean("fake") || false;

        let guild_member;

        if (member)
            guild_member = await interaction.guild.members.fetch(member.fetch());
        else if (member_id)
            try { guild_member = await interaction.guild.members.fetch(member_id); }
            catch { return interaction.reply({ content: "Could not find member using the provided id.", ephemeral: true }); }
        else
            return interaction.reply({ content: "You didn't specify who you wanted to kick.", ephemeral: true });

        // Permission Checks:
        // Checks if the target was the guild owner:
        if (guild_member.id == interaction.guild.ownerId)
            return interaction.reply("The server owner is way too cool to be kicked!");

        // Checks if the target was ourself:
        if (guild_member.id == client.user.id)
            return interaction.reply("You dare try to kick me? You fool! I'm too powerful for that!");

        // Checks if the target was themself:
        if (guild_member.id == interaction.user.id)
            return interaction.reply("You can't kick yourself...");

        // Checks if the target is a server administrator:
        if (guild_member.permissions.has("ADMINISTRATOR"))
            return interaction.reply("You can't kick a server admin, fool.");

        // Checks if they have a higher or equal role than their target:
        if (guild_member.roles.highest.position >= interaction.member.roles.highest.position)
            return interaction.reply("I will not allow you to kick someone with a higher or equal role to you, peasant.");

        // Checks if the bot has a higher or equal role than the target:
        if (guild_member.roles.highest.position >= interaction.guild.me.roles.highest.position)
            return interaction.reply("I can't kick someone with a higher or equal role to myself.");

        // Now to actually kick the member:
        if (fake) {
            if (interaction.guild.systemChannel)
                interaction.guild.systemChannel.send(`**${guild_member.user.tag}** suddenly decided to leave. Goodbye!`);

            return interaction.reply(`**${guild_member.user.tag}** has been kicked from the server.`);
        } else {
            if (await guild_member.kick(reason)) {
                if (interaction.guild.systemChannel)
                    interaction.guild.systemChannel.send(`**${guild_member.user.tag}** suddenly decided to leave. Goodbye!`);

                auditLogger.logMemberKick(client, guild_member, guild_data, reason, interaction.user);
                return interaction.reply(`**${guild_member.user.tag}** has been kicked from the server!\nReason: ${reason}`);
            } else
                return interaction.reply({ content: "Failed to kick member from the server.", ephemeral: true });
        }
    }
}