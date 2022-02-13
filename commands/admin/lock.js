// Disable the SEND_MESSAGES permission for a channel for either @everyone or a certain role.

const { MessageEmbed, Permissions } = require('discord.js');
const { GetChannelFromNameOrID, GetRoleFromNameOrID } = require('../../modules/guildTools');

const { embedColor } = require('../../configs/clientSettings.json');

const cmdName = "lock";
const aliases = [];

const description = "Disable the SEND_MESSAGES permission for a channel for either @everyone or a certain role.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    requireGuildMemberHaveAdmin: true,
    specialPermissions: [Permissions.FLAGS.MANAGE_CHANNELS],

    execute: async (client, message, commandData) => {
        let channel = message.mentions.channels.first() || null;
        let role = message.mentions.roles.first() || null;

        // Get the channel from either the channel name or channel ID
        if (!channel && commandData.args[0]) {
            let fetchedChannel = await GetChannelFromNameOrID(message.guild, commandData.args[0].toLowerCase());

            if (fetchedChannel)
                channel = fetchedChannel;
            else
                return await message.reply({ content: "I can't lock a non-existent channel, dumbass." });
        } else
            channel = message.channel;

        // Get the role from either the role name or role ID
        if (!role && commandData.args[1]) {
            let fetchedRole = await GetRoleFromNameOrID(message.guild, commandData.args[1].toLowerCase());

            if (fetchedRole)
                role = fetchedRole;
            else
                return await message.reply({
                    content: "Outstanding job, idiot. You gave me an invalid role. Better luck next year."
                });
        } else
            role = message.guild.roles.everyone;

        try {
            // Try changing the (SEND_MESSAGES) permission for the specified channel and role
            channel.permissionOverwrites.edit(role, { SEND_MESSAGES: false });

            // Create an embed to show our success
            let embed = new MessageEmbed()
                .setDescription(`🔒 ${channel} has been **locked** for ${role}`)
                .setColor(embedColor.ERROR);

            // Send the success embed saying the channel has been locked
            return await message.channel.send({ embeds: [embed] });
        } catch {
            // Formatted strings for cleaner embed creation below
            let failedReply = "Failed to lock channel $CHANNEL for role $ROLE"
                .replace("$CHANNEL", channel.fetch() ? channel : "\`missing_channel\`")
                .replace("$ROLE", role.fetch() ? role : "\`missing_role\`");

            // Create an embed to show the fact we absolutely suck at life and couldn't go through with the command
            let embed = new MessageEmbed()
                .setDescription(failedReply)
                .setColor(embedColor.ERROR);

            // Send off our failure to the user
            return await message.reply({ embeds: [embed] });
        }
    }
}