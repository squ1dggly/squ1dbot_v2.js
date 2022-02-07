// Deletes a specified amount of messages within a channel.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { timeouts } = require('../../configs/clientSettings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("name")
        .setDescription("description")

        .addNumberOption(option => option.setName("amount")
            .setDescription("The amount of messages you would like to purge")
            .setRequired(true))
        .addUserOption(option => option.setName("from")
            .setDescription("Only purge messages by a specific member")),

    execute: async (client, interaction) => {
        let amount = interaction.options.getNumber("amount");
        let fromMember = interaction.options.getuser("from");

        try {
            interaction.channel.bulkDelete(amount)
                .then(() => {
                    interaction.editReply(`Deleted `)
                });
        }

        // TODO: filter through guild memebers to only delete messages from a specific member if (fromMember) isn't null
    }
}