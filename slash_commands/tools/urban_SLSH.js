// Search the urban dictionary for a definition.

const fetch = require('node-fetch');

const { SlashCommandBuilder } = require('@discordjs/builders');

const { urban_CS } = require('../../embed_styles/commandStyles');
const { RandomChoice, RandomChance } = require('../../modules/jsTools');
const { urbanCommandTip, urbanEmptyResults } = require('../../configs/commandResponseList.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("urban")
        .setDescription("Search the urban dictionary for a definition.")

        .addStringOption(option => option.setName("keywords")
            .setDescription("What you want to search.")
            .setRequired(true))

        .addNumberOption(option => option.setName("limit")
            .setDescription("How many definitions would you like to see?"))

        .addBooleanOption(option => option.setName("ephemeral")
            .setDescription("If set to true only you will be able to see this message.")),

    execute: async (client, interaction) => {
        let term = interaction.options.getString("keywords");
        let queryLimit = interaction.options.getNumber("limit") | 1;
        let ephemeral = interaction.options.getBoolean("ephemeral") || false;

        try {
            return await Search(term).then(async query => {
                if (!query) return await interaction.reply({
                    content: `Search results for \`${term}\` turned up empty.${RandomChoice(urbanEmptyResults)}`
                });

                query = { searchedTerm: term, definitions: query };
                let embed = urban_CS(query, queryLimit);

                return await interaction.reply({ embeds: [embed] });
            });
        } catch (err) {
            console.error(err);

            return await interaction.reply({
                content: "Failed to conduct search. Half our team didn't turn in today.",
                ephemeral: ephemeral
            });
        }
    }
}

// >> Custom Functions
async function Search(term) {
    let query = new URLSearchParams({ term });
    let response = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(r => r.json());

    return (response.list && response.list.length > 0) ? response.list : null;
}