// Warn a naughty member of the server.

const { GetMemberFromNameOrID } = require('../../modules/guildTools');
const { publishUserWarn } = require('../../modules/mongo');

const cmdName = "warn";
const aliases = [];

const description = "Warn a naughty member of the server.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        let guildMember = message.mentions.members.first() || null;

        // If the (member) argument wasn't a mention or it was a name/nickname/userID try to find the user in the server
        // and if the user doesn't exist just show the avatar of the current user
        if (!guildMember && commandData.args[0]) {
            let fetchedMember = await GetMemberFromNameOrID(message.guild, commandData.args[0].toLowerCase());

            if (fetchedMember.user) guildMember = fetchedMember;
            else return await message.reply({
                content: "I can't see your imaginary friends, dude. Mention someone who actually exists."
            });
        }

        // If (guildMember) is still null then cancel the command because we need a member to actually give the warn to
        if (!guildMember) return await message.channel.send({
            content: "I oughta warn *you* for not telling me who I'm even supposed to be warning."
        });

        // Remove the first member argument and join together the remaining arguments to form the reason
        let reason = commandData.args;
        reason.shift();
        reason = reason.join(" ");

        // If the (reason) wasn't provided set (reason) to ("n/a")
        if (reason === "") reason = "Not provided.";

        // Publish the user warn to our mongo database
        return await publishUserWarn(message.guild.id, guildMember.id, reason, message.createdTimestamp).then(async warn => {
            return await message.channel.send({ content: `Warn published for ${guildMember.user}\n**Reason:** \"${warn.data.reason}\"` });
        }).catch(async err => {
            console.error(err);
            
            return await message.reply({ content: `Failed to submit warn to user ${guildMember.user.tag}` });
        });
    }
}