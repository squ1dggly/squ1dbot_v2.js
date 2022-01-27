// Logging embed templates useful for quick audit logging if the server has a channel set for it.

const { MessageEmbed } = require('discord.js');
const { time } = require('@discordjs/builders');

module.exports = {
    deletedMessage_LS: (message) => {
        let embed = new MessageEmbed()
            .setAuthor(`A message by ${message.author.tag} was deleted`, message.author.displayAvatarURL())
    
            .addField("Message Author", `${message.author}`, true)
            .addField("Message Channel", `${message.channel}`, true)
    
            .addField("Message Sent", time(message.createdAt))
    
            .addField("Content", message.content)
            .addField("Attachments", `${message.attachments}`)
    
            .setTimestamp(Date.now());
    
        if (message.attachments != "None")
            try { embed.setImage(message.attachments); }
            catch { }
    
        return embed;
    },

    kickedMember_LS: (kickedMember, reason, kickedBy=null) => {
        let embed = new MessageEmbed()
            .addField("Reasoon", reason)
            .setTimestamp(Date.now());
    
        if (kickedBy)
            embed.setTitle(`${kickedMember.tag} was kicked from the server by ${kickedBy}`, kickedMember.displayAvatarURL());
        else
            embed.setTitle(`${kickedMember.tag} was kicked from the server`, kickedMember.displayAvatarURL());
    
        return embed;
    }
}