// Handles sending audit logs to the server if there's an audit channel set.

const { deletedMessage_LS, kickedMember_LS } = require('../embed_styles/auditLogStyles');

module.exports = {
    LogMessageDelete: async (client, message, guildData) => {
        let audit_channel_id = guildData.channels.get("audit_logs");
        if (!audit_channel_id) return;

        let audit_channel = await message.guild.channels.fetch(audit_channel_id);

        if (audit_channel) audit_channel.send({ embeds: [deletedMessage_LS(client, message)] });
    },

    LogKickedMember: async (client, kickedMember, guildData, reason, kickedBy=null) => {
        let audit_channel_id = guildData.channels.get("audit_logs");
        if (!audit_channel_id) return;

        let audit_channel = await message.guild.channels.fetch(audit_channel_id);

        if (audit_channel) audit_channel.send({ embeds: [kickedMember_LS(client, kickedMember, reason, kickedBy)] });
    }
}