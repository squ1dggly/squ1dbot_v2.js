// List all warns a member has.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const clientSettings = require('../../configs/clientSettings.json');
const mongo = require('../../modules/mongo');

function formatUserWarns(warn_array, limit = 0) {
    if (warn_array.length == 0) return "None";

    if (limit > 0)
        if (warn_array.length > limit) {
            const remainder = warn_array.length - limit;
            
            warn_array = warn_array.slice(0, limit);
            warn_array.push(`*+ ${remainder} more...*`);
        }

    let formatted = "";

    warn_array.forEach(warn => {
        if (warn.id) formatted += `${warn.formatted}\n\n`; else formatted += warn;
    });

    return formatted;
}

const memberWarnsEmbed = (client, interaction, guild_member, warn_array) => {
    const formattedWarns = formatUserWarns(warn_array);

    const message_sent_at = Intl.DateTimeFormat("en", { timeStyle: "short" }).format(interaction.createdAt);

    const embed = new MessageEmbed()
        .setAuthor(`Displaying All Warns for ${guild_member.user.tag}`, guild_member.user.avatarURL())
        .setThumbnail(guild_member.user.avatarURL())

        .addField(`Warns (${warn_array.length})`, formattedWarns)

        .setFooter(`UserId: ${guild_member.user.id} | Sent at ${message_sent_at}`)
        .setColor(clientSettings.embedColor.MAIN);

    return embed;
}

module.exports = {
    isAdminCommand: true,

    data: new SlashCommandBuilder()
        .setName("listwarns")
        .setDescription("List all warns a member has.")
        .addUserOption(option => option.setName("member").setDescription("The member you want to list"))
        .addStringOption(option => option.setName("member-id").setDescription("The member you want to list using their id"))
        .addBooleanOption(option => option.setName("ephemeral").setDescription("If set to true only you will be able to see this message")),

    execute: async (client, interaction) => {
        const member = interaction.options.getUser("member");
        const member_id = interaction.options.getString("member-id");
        const ephemeral = interaction.options.getBoolean("ephemeral") || false;

        let guild_member;

        if (member)
            guild_member = await interaction.guild.members.fetch(member.id);
        else if (member_id)
            try { guild_member = await interaction.guild.members.fetch(member_id); }
            catch { return interaction.reply({ content: "Could not find member using the provided id.", ephemeral: true }); }
        else
            guild_member = interaction.member;

        // Message Embed:
        const warn_array = await mongo.retrieveUserWarns(interaction.guild.id, guild_member.id);
        const userWarn_embed = memberWarnsEmbed(client, interaction, guild_member, warn_array);

        interaction.reply({ embeds: [userWarn_embed], ephemeral: ephemeral });
    }
}