// Deletes a specified amount of messages within a channel.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

const { FetchAndDeleteMessagesInChannel } = require('../../modules/guildTools');
const { timeouts } = require('../../configs/clientSettings.json');

module.exports = {
    requireGuildMemberHaveAdmin: true,
    specialPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],

    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete messages from the current channel optionally filtering by member and or phrase. Limit: 100")

        .addNumberOption(option => option.setName("amount")
            .setDescription("The amount of messages you would like to purge")
            .setRequired(true))
        .addStringOption(option => option.setName("includes")
            .setDescription("Filter messages by a word or phrase"))
        .addUserOption(option => option.setName("from")
            .setDescription("Only purge messages by a specific member")),

    execute: async (client, interaction) => {
        let amount = interaction.options.getNumber("amount");
        let includes = interaction.options.getString("includes") || null;
        let fromMember = interaction.options.getUser("from") || null;

        // Formatted strings for a cleaner reply function below
        let reply_before = "Purging \`$AMT\` $MSG... ⏳$INCLUDES$FROM";
        let reply_after = "Purged \`$AMT\` $MSG.$INCLUDES$FROM";
        
        // Reply to the user saying we've started the purge
        interaction.editReply({
            content: reply_before
                .replace("$AMT", amount)
                .replace("$MSG", amount > 1 ? "messages" : "message")
                .replace("$INCLUDES", includes ? `\nFiltering by phrase: \`${includes}\`` : "")
                .replace("$FROM", fromMember ? `\nFiltering by member: \`${fromMember.username}\`` : "")
        })
        
        // Once successfully purged show how many messages were actually deleted
        .then(async message => FetchAndDeleteMessagesInChannel(message.channel, message.id, amount, includes, fromMember).then(purged =>
            interaction.editReply({
                content: reply_after
                .replace("$AMT", amount)
                .replace("$MSG", amount > 1 ? "messages" : "message")
                .replace("$INCLUDES", includes ? `\nFiltering by phrase: \`${includes}\`` : "")
                .replace("$FROM", fromMember ? `\Filtering by member: \`${fromMember.username}\`` : "")
            }).then(() => setTimeout(() => message.delete(), timeouts.warningMessage.ALERT))
        ));
    }
}