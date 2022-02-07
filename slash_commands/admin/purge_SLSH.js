// Deletes a specified amount of messages within a channel.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { timeouts } = require('../../configs/clientSettings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete messages from the current channel optionally filtering by member.")

        .addNumberOption(option => option.setName("amount")
            .setDescription("The amount of messages you would like to purge")
            .setRequired(true))
        .addUserOption(option => option.setName("from")
            .setDescription("Only purge messages by a specific member")),

    execute: async (client, interaction) => {
        let amount = interaction.options.getNumber("amount");
        let fromMember = interaction.options.getUser("from");

        if (!fromMember)
            try {
                interaction.channel.bulkDelete(amount)
                    .then(() => interaction.editReply(`Purged ${amount} ${amount > 1 ? "messages" : "message"}.`));
            } catch {
                return;
            }
        else
            try {
                interaction.channel.fetchMessages({ limit: amount })
                    .then(messages => {
                        messages = messages.filter(message => message.author.id === fromMember.id)
                            .array()
                            .slice(0, amount);

                        interaction.channel.bulkDelete(messages);
                    });

                return await interaction.editReply({
                    content: `Purges ${amount} ${amount > 1 ? "messages" : "message"} from member \`${fromMember.displayName}\``
                });
            } catch {
                return;
            }
    }
}