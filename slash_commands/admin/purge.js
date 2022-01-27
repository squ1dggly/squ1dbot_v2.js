// Deletes a specified amount of messages within a channel.

const { SlashCommandBuilder } = require('@discordjs/builders');
const clientSettings = require('../../configs/clientSettings.json');

module.exports = {
    isAdminCommand: true,

    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete a specific amount of messages within a channel.")
        .addNumberOption(
            option => option.setName("amount").setDescription("The amount of messages to delete").setRequired(true)
        ),

    execute: async (client, interaction) => {
        let amount = interaction.options.getNumber("amount");

        if (amount < 1) return interaction.reply({ content: "You have to use a number greater than 0.", ephemeral: true });

        interaction.channel.bulkDelete(amount);
        
        let response = (amount > 1) ? `Deleted \`${amount}\` messages.` : "Deleted \`1\` message.";

        interaction.reply(response)
            .then(() => setTimeout(() => interaction.deleteReply(), clientSettings.MSGTIMEOUT_TASKCOMPLETED));
    }
}