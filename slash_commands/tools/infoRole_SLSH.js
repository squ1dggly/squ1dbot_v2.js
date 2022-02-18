// Get information about a role in the current guild.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { roleInfo_ES } = require('../../embed_styles/guildInfoStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inforole")
        .setDescription("Get information about a role in the current guild.")

        .addRoleOption(option => option.setName("role")
            .setDescription("The role you would like to info."))

        .addBooleanOption(option => option.setName("ephemeral")
            .setDescription("If set to true only you will be able to see this message.")),

    execute: async (client, interaction) => {
        let role = interaction.options.getRole("role") || interaction.member.roles.highest;
        let ephemeral = interaction.options.getBoolean("ephemeral") || false;

        try {
            let embed = roleInfo_ES(role, role.permissions.toArray());

            return await interaction.reply({
                embeds: [embed],
                ephemeral: ephemeral
            });
        } catch (err) {
            console.error(err);

            return await interaction.reply({ content: "I was unable to find the specified role. Try again next year." });
        }
    }
}