// Remove a warn from said used-to-be naughty member of the server

const { removeUserWarn, validateUserWarn } = require('../../modules/mongo');

const cmdName = "removewarn";
const aliases = ["warnremove"];

const description = "Remove a warn from said used-to-be naughty member of the server.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    requireGuildMemberHaveAdmin: true,

    execute: async (client, message, commandData) => {
        let warnID = commandData.args[0];

        // If the warn ID argument was empty cancel the function
        if (!warnID) return await message.reply({
            content: "Successfully removed uh... What warn? You didn't even give me the warn's ID."
        });

        // Checks if the gived ID was a valid warn id in the current guild
        let vaildated = await validateUserWarn(message.guild.id, warnID);
        if (!vaildated) return await message.reply({
            content: "The warn ID you provided is invalid."
        });

        // If all checks passed then remove the warn from our mongo database
        return await removeUserWarn(message.guild.id, warnID).then(async removedWarn => {
            return await message.guild.members.fetch(removedWarn.userID).then(async guildMember => {
                // If the member was found in the guild at the time of this command show their username
                return await message.channel.send({ content: `Removed warn from user **${guildMember.user.tag}**` });
            }).catch(async err => {
                // If the member wasn't found in the guild just let the user know that the warn was removed
                return await message.channel.send({ content: "Warn removed." });
            });
        }).catch(async err => {
            console.error(err);

            // If removing the warn was unsuccessful
            return await message.channel.send({ content: `Failed to remove warn \`${warnID}\`.` });
        });
    }
}