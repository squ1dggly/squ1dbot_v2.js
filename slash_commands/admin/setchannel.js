// Set custom channels for the bot to use.

const { SlashCommandBuilder } = require('@discordjs/builders');

const mongo = require('../../modules/mongo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setchannel")
        .setDescription("Set custom channels for the bot to use.")
        .addStringOption(option => option.setName("type").setDescription("The type of channel this is")
            .addChoice("audit-logs", "audit_logs")
            .setRequired(true))
        .addChannelOption(option => option.setName("channel").setDescription("The channel you want to set"))
        .addBooleanOption(option => option.setName("reset").setDescription("Defaults the set channel here to none")),

    execute: async (client, interaction, guild_data) => {
        const type = interaction.options.getString("type");
        const channel = interaction.options.getChannel("channel") || interaction.channel;
        const reset = interaction.options.getBoolean("reset") || false;

        if (type == "audit_logs") {
            if (reset)
                resetChannel(client, interaction, type, guild_data)
                    .then(() => interaction.reply(`**Audit logs** will no longer be sent.`))
                    .catch(console.error);
            else
                setChannel(client, interaction, type, channel.id, guild_data)
                    .then(() => interaction.reply(`**Audit logs** will now be sent to ${channel}`))
                    .catch(console.error);
            return;
        }
    }
}

async function setChannel(client, interaction, channel_type, channel_id, guild_data) {
    const guild_channels = guild_data.channels;
    guild_channels.set(channel_type, channel_id);

    await mongo.updateGuild(interaction.guild.id, { channels: guild_channels });
}

async function resetChannel(client, interaction, channel_type, guild_data) {
    const guild_channels = guild_data.channels;
    guild_channels.delete(channel_type);

    await mongo.updateGuild(interaction.guild.id, { channels: guild_channels });
}