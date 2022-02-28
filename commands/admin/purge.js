// Deletes a specified amount of messages within a channel.

const { Permissions } = require('discord.js');
const { FetchAndDeleteMessagesInChannel, GetMemberFromNameOrID } = require('../../modules/guildTools');
const { RandomChance } = require('../../modules/jsTools');

const { timeouts } = require('../../configs/clientSettings.json');

const cmdName = "purge";
const aliases = [];

const description = "Delete messages from the current channel optionally filtering by member and or phrase. Limit: 100";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    requireGuildMemberHaveAdmin: true,
    specialPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],

    execute: async (client, message, commandData) => {
        let amount = parseInt(commandData.args[0]) || 0;
        let includes = commandData.splitContent("--i")[1] || null;
        let fromMember = message.mentions.members.first() || null;

        // If the amount wasn't specified or the user purposely put "0" to fuck with us
        // return a replied message telling the user to give an amount to purge
        // with a 1 in 4 chance to give them a couple tips about this command
        if (amount === 0) {
            let tip1 = "*You can optionally filter by member by mention, user ID, or username/nickname.*";
            let tip2 = "*You can also filter by word or phrase by addiing the \`--i\` tag and putting the phrase after.*";
            let tip3 = `*Format: \`${commandData.guildData.guildPrefixes[0]}\`purge 5 --i hello`;

            return await message.reply({
                content: `You've failed to tell me how many messages you wanted to purge.${RandomChance(3) ? `\n\n${tip1}\n${tip2}\n${tip3}` : ""}`
            });
        }

        // If the (member) argument wasn't a mention or it was a name/nickname/userID try to find the user in the server
        // and if the user doesn't exist continue purging all
        if (!fromMember && commandData.args[1]) {
            let fetchedMember = await GetMemberFromNameOrID(message.guild, commandData.args[1].toLowerCase());

            if (fetchedMember) fromMember = fetchedMember;
            else return await message.reply({
                content: "I was unable to find the member you mentioned in the server. Try again or leave it blank to purge all."
            });
        }

        // Formatted strings for a cleaner reply function below
        let reply_before = "Purging \`$AMT\` $MSG... ⏳$INCLUDES$FROM";
        let reply_after = "Purged \`$AMT\` $MSG.$INCLUDES$FROM";

        // Reply to the user saying we've started the purge
        return await message.channel.send({
            content: reply_before
                .replace("$AMT", amount)
                .replace("$MSG", amount > 1 ? "messages" : "message")
                .replace("$INCLUDES", includes ? `\nFiltering by phrase: \`${includes}\`` : "")
                .replace("$FROM", fromMember ? `\nFiltering by member: \`${fromMember.user.username}\`` : "")
        }).then(async msg => {
            await message.delete().catch(err => console.err(err));

            // Once successfully purged show how many messages were actually deleted
            await FetchAndDeleteMessagesInChannel(message.channel, msg.id, amount, includes, fromMember).then(async purged => {
                await msg.edit({
                    content: reply_after
                        .replace("$AMT", purged)
                        .replace("$MSG", purged > 1 ? "messages" : "message")
                        .replace("$INCLUDES", includes ? `\nFiltered by phrase: \`${includes}\`` : "")
                        .replace("$FROM", fromMember ? `\nFiltered by member: \`${fromMember.user.username}\`` : "")
                }).then(() => setTimeout(async () => await msg.delete(), timeouts.warningMessage.ALERT));
            });
        });
    }
}