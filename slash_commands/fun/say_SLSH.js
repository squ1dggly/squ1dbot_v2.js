// Tell the bot what you want it to say.

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Give me something to say!")
        .addStringOption(
            option => option.setName("input").setDescription("All the things you would like me to say").setRequired(true)
        ),

    execute: async (client, interaction) => {
        const inout = interaction.options.getString("input");

        interaction.reply({ content: "Message sent!", ephemeral: true })
        interaction.channel.send(inout);
    }
}