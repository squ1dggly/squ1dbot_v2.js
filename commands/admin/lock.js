// Disables the (send message) permission from within a channel.

const { MessageEmbed } = require('discord.js');
const { embedColor } = require('../../configs/clientSettings.json');

const cmdName = "lock";
const aliases = [];

const description = "Disables the (send message) permission from within a channel.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        let channel;
        let role;

        // Channel to lock:
        if (!isNaN(commandData.args[0]))
            try { channel = await message.guild.channels.fetch(commandData.args[0]); }
            catch { return message.channel.send("I can't lock a non-existent channel, dumbass."); }
        else
            channel = message.mentions.channels.first() || message.channel;

        // Role to lock:
        if (!isNaN(commandData.args[1]))
            try { role = await message.guild.roles.fetch(commandData.args[1]); }
            catch { return message.channel.send("Outstanding job, idiot. You gave me an invalid role. Better luck next year.") }
        else
            role = message.mentions.roles.first() || message.guild.roles.everyone;

        // Lock the channel:
        try { channel.permissionOverwrites.edit(role, { SEND_MESSAGES: false }); }
        catch { return message.channel.send(`Failed to lock channel ${(channel) ? channel : "\`missingno\`"}`) }

        let embed = new MessageEmbed()
            .setDescription(`🔒 ${channel} has been **locked** for ${role}`)
            .setColor(embedColor.MAIN);

        message.channel.send({ embeds: [embed] });
    }
}