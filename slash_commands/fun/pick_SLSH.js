// Ask the bot to pick one of 2 or more choices for you

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { CleanStringArrayWhitespace, RandomChance, RandomChoice } = require('../../modules/jsTools');

const { embedColor } = require('../../configs/clientSettings.json');
const responses = require('../../configs/commandResponseList.json').pick;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pick")
        .setDescription("Ask the bot to pick one of 2+ choices for you.")

        .addStringOption(option => option.setName("options")
            .setDescription("Seperate options using a comma (,) for multiple choices.").setRequired(true))
        .addBooleanOption(option => option.setName("ephemeral")
            .setDescription("If set to true only you will be able to see this message")),

    execute: async (client, interaction) => {
        let args = CleanStringArrayWhitespace(interaction.options.getString("options").split(","));
        let ephemeral = interaction.options.getString("ephemeral") || false;

        let embed = new MessageEmbed();

        // If the user gave us less than 2 options which completely defeats the purpose of using this command
        if (args.length < 2) {
            embed.setTitle("Are you really that indecisive that you couldn't pick between a single option?")
                .setDescription((RandomChance(2)) ? "Tip: seperate your options using a comma (,) for multiple choices." : null)
                .setColor(embedColor.ERROR);

            return await interaction.editReply({ embeds: [embed] });
        }

        // If the user didn't fail at giving us more than 1 option; pick something random and tell the user what our choice was
        let choice = RandomChoice(args);
        let response = RandomChoice(responses);

        embed.setTitle(response).setDescription(choice).setColor(embedColor.MAIN);
        return await interaction.editReply({ embeds: [embed], ephemeral: ephemeral });
    }
}