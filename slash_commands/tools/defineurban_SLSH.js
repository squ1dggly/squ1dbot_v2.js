// Asks the urban dictionary for a definition.

const fetch = require('node-fetch');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const clientSettings = require('../../configs/clientSettings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("defineurban")
        .setDescription("Define something the urban way!")
        .addStringOption(option => option.setName("search").setDescription("What you'd like to find the definition for").setRequired(true))
        .addNumberOption(option => option.setName("limit").setDescription("How many definitions would you like")
            .addChoice("1", 1)
            .addChoice("2", 2)
            .addChoice("3", 3)
            .addChoice("4", 4)
            .addChoice("5", 5)),

    execute: async (client, interaction) => {
        await interaction.deferReply();

        let term = interaction.options.getString("search").toLowerCase();
        let limit = interaction.options.getNumber("limit") || 1;

        try {
            let query = await search(term);
            let def_embed = createDefinitionEmbed(client, interaction, term, query, limit);

            if (!def_embed)
                return interaction.editReply(`Not even I could figure out what \"${term}\" means!`);
            else
                interaction.editReply({ embeds: [def_embed] });
        } catch (err) {
            interaction.editReply("Failed to conduct search. One of our volunteers called in sick today. Please try again later.");
        }
    }
}

async function search(term) {
    let query = new URLSearchParams({ term });
    let response = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(r => r.json());

    return (response.list && response.list.length > 0) ? response.list : null;
}

function createDefinitionEmbed(client, interaction, searched, query, limit = 1) {
    if (query.length == 0) return null;
    query = query.slice(0, limit);

    let embed = new MessageEmbed()
        .setTitle(`Defining \"${searched}\" in Urban:`)
        .setTimestamp(interaction.createdTimestamp)
        .setColor(clientSettings.embedColor.MAIN);

    let index = 0;
    query.forEach(def => {
        embed.addField(`Definition ${index + 1}/${query.length}:`, def.definition);
        embed.addField("Example:", `\`\`\`${def.example}\`\`\``);
        embed.addField("\u200b", `Author: **${def.author}**\n:thumbsup: ${def.thumbs_up} || :thumbsdown: ${def.thumbs_down}\n[link](${def.permalink})`);

        index++;
    });

    return embed;
}