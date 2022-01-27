// Remove a warn using the warn's id.

const { SlashCommandBuilder } = require('@discordjs/builders');
const mongo = require('../../modules/mongo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removewarn")
        .setDescription("Remove a warn using the warn's id.")
        .addStringOption(option => option.setName("id").setDescription("The id of the warn you want to remove").setRequired(true)),

    execute: async (client, interaction) => {
        const warn_id = interaction.options.getString("id");

        try {
            if (!await mongo.validateUserWarn(interaction.guild.id, warn_id))
                return interaction.reply({ content: "Invalid warn id.", ephemeral: true });

            let removed_warn = await mongo.removeUserWarn(interaction.guild.id, warn_id);
            let guild_member = await interaction.guild.members.fetch(removed_warn.userId);

            if (guild_member)
                interaction.reply(`Removed warn from user **${guild_member.user.tag}**`);
            else
                interaction.reply(`Warn has been removed.`); 
        } catch {
            interaction.reply({ content: "Failed to remove warn.", ephemeral: true });
        }
    }
}