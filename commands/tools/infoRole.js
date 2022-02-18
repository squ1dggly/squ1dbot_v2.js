// Get information about a role in the current guild.

const { roleInfo_ES } = require('../../embed_styles/guildInfoStyles');
const { GetRoleFromNameOrID } = require('../../modules/guildTools');

const cmdName = "inforole";
const aliases = ["roleinfo"];

const description = "Get information about a role in the current guild.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        let role = message.mentions.roles.first() || null;

        // If the (role) argument wasn't a mention or it was a name/roleID try to find the role in the guild
        // and if the role doesn't exist just show the highest role of the current user
        if (!role && commandData.args[0]) {
            fetchedRole = await GetRoleFromNameOrID(message.guild, commandData.args[0].toLowerCase());

            if (fetchedRole) role = fetchedRole;
            else return await message.reply({
                content: "I was unable to find the specified role. Better luck next year."
            });
        } else if (!role && !commandData.args[0])
            role = message.member.roles.highest;

        // Attempt to create the role information embed
        let embed = roleInfo_ES(role, role.permissions.toArray());

        return await message.channel.send({ embeds: [embed] });
    }
}