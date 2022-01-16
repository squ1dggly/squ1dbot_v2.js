// Asks the urban dictionary for the definition to a slang-like word.

const fetch = require('node-fetch');

const { MessageEmbed } = require('discord.js');
const { embedColor } = require('../../configs/clientSettings.json');

const cmdName = "urban";
const aliases = [];

const description = "Ask the urban dictionary for the definition to a slang-like word.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        if (!commandData.args[0]) return message.channel.send("You imbecile. What am I supposed to search?");

        let term = commandData.args[0];
        let limit = (!isNaN(commandData.args[1])) ? parseInt(commandData.args[1]) : 1;

        try {
            let query = await search(term.toLowerCase());
            let def_embed = createDefinitionEmbed(client, message, term, query, limit);

            if (!def_embed)
                return message.channel.send(`Not even I could figure out what \"${term}\" means!`);
            else
                message.channel.send({ embeds: [def_embed] });
        } catch (err) {
            console.error(err);
            message.channel.send("Failed to conduct search. One of our volunteers called in sick today. Please try again later.");
        }
    }
}

async function search(term) {
    let query = new URLSearchParams({ term });
    let response = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(r => r.json());

    return (response.list && response.list.length > 0) ? response.list : null;
}

function createDefinitionEmbed(client, message, searched, query, limit = 1) {
    if (query.length == 0) return null;
    query = query.slice(0, limit);

    let embed = new MessageEmbed()
        .setTitle(`*${searched}* in Urban`)
        .setTimestamp(message.createdTimestamp)
        .setColor(embedColor.MAIN);

    let index = 0;
    query.forEach(def => {
        embed.addField(`Definition ${index + 1}/${query.length}`, def.definition);
        embed.addField("Example:", `\`\`\`${def.example}\`\`\``);
        embed.addField("\u200b", `Author: **[${def.author}](${def.permalink})**\n👍 ${def.thumbs_up} || 👎`);

        index++;
    });

    return embed;
}