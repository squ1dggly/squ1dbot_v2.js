// View the current warns a user has

const { memberWarns_ES } = require('../../embed_styles/guildInfoStyles');
const { GetMemberFromNameOrID } = require('../../modules/guildTools');
const { retrieveUserWarns } = require('../../modules/mongo');

const cmdName = "memberwarns";
const aliases = ["userwarns", "viewwarns", "listwarns"];

const description = "View the current warns a user has.";

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
        } else if (!guildMember && !commandData.args[0])
            guildMember = message.member;

        // Fetch the guild member's warns in the current server
        return await retrieveUserWarns(message.guild.id, guildMember.id).then(async fetchedWarns => {
            let embed = memberWarns_ES(guildMember, fetchedWarns, 10);

            return await message.channel.send({ embeds: [embed] });
        });
    }
}