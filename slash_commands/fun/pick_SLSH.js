// Ask the bot to pick one of 2+ choices for you.

const { SlashCommandBuilder } = require('@discordjs/builders');

const responses = [
    "Sometimes the simplest of answers are:",
    "The best option is clearly:",
    "It has been decided:",
    "'Twas a no brainer:",
    "The answer is:",
    "I choose..."
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pick")
        .setDescription("Pick something random out of 2+ options.")
        .addStringOption(option => option.setName("option1").setDescription("Your 1st option").setRequired(true))
        .addStringOption(option => option.setName("option2").setDescription("Your 2nd option").setRequired(true))
        .addStringOption(option => option.setName("option3").setDescription("Your 3rd option"))
        .addStringOption(option => option.setName("option4").setDescription("Your 4th option"))
        .addStringOption(option => option.setName("option5").setDescription("Your 5th option"))
        .addStringOption(option => option.setName("option6").setDescription("Your 6th option"))
        .addStringOption(option => option.setName("option7").setDescription("Your 7th option"))
        .addStringOption(option => option.setName("option8").setDescription("Your 8th option"))
        .addStringOption(option => option.setName("option9").setDescription("Your 9th option"))
        .addStringOption(option => option.setName("option10").setDescription("Your 10th option"))
        .addBooleanOption(option => option.setName("ephemeral").setDescription("If set to true only you will be able to see this message")),

    execute: async (client, interaction) => {
        const option1 = interaction.options.getString("option1");
        const option2 = interaction.options.getString("option2");
        const option3 = interaction.options.getString("option3") || null;
        const option4 = interaction.options.getString("option4") || null;
        const option5 = interaction.options.getString("option5") || null;
        const option6 = interaction.options.getString("option6") || null;
        const option7 = interaction.options.getString("option7") || null;
        const option8 = interaction.options.getString("option8") || null;
        const option9 = interaction.options.getString("option9") || null;
        const option10 = interaction.options.getString("option10") || null;

        const ephemeral = interaction.options.getBoolean("ephemeral") || false;

        let choices = [
            option1,
            option2,
            option3,
            option4,
            option5,
            option6,
            option7,
            option8,
            option9,
            option10
        ];

        choices = choices.filter(c => c != null);

        const choice = choices[Math.floor(Math.random() * choices.length)];
        const response = responses[Math.floor(Math.random() * responses.length)];

        interaction.reply({ content: `${response} ${choice}`, ephemeral: ephemeral });
    }
}