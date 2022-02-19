// Asks the urban dictionary for the definition to a slang-like word.

const fetch = require('node-fetch');
const { RandomChoice, RandomChance } = require('../../modules/jsTools');
const { urban_CS } = require('../../embed_styles/commandStyles');

const cmdName = "urban";
const aliases = ["defineurban", "searchurban"];

const description = "Ask the urban dictionary for the definition to a slang-like word.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        let commandTip_examples = [
            `${commandData.guildData.prefixes[0]} urban barack obama, 2`
            `${commandData.guildData.prefixes[0]} urban pizza, 3`
            `${commandData.guildData.prefixes[0]} urban 420 blaze it, 4`
            `${commandData.guildData.prefixes[0]} urban rule34, 5`
            `${commandData.guildData.prefixes[0]} urban bite of 87, 6`
            `${commandData.guildData.prefixes[0]} urban ratio, 7`
            `${commandData.guildData.prefixes[0]} urban mald, 8`
            `${commandData.guildData.prefixes[0]} urban cope, 9`
            `${commandData.guildData.prefixes[0]} urban cheeseburger, 10`
        ]

        let commandTip = RandomChance(4) ? "\n\n$TIP" : ""
            .replace(`Tip: You can view more than 1 definition by adding a comma \`,\` and then the number of definitions you want`
                + `\n ex: \`${RandomChoice(commandTip_examples)}\``);

        if (!commandData.args[0]) return await message.reply({
            content: `You imbecile. What am I even supposed to search?${commandTip}`
        });

        let splitArgs = commandData.splitContent(",");
        let term = splitArgs[0].toLowerCase();
        let queryLimit = splitArgs[1] || 1;

        try {
            return await Search(term).then(query => {
                if (query.length === 0) return await message.reply({
                    content: `Search results for \`${term}\` turned up empty. Just like your father did.${commandTip}`
                });

                query = { searchedTerm: term, definitions: query };
                let embed = urban_CS(query, queryLimit);

                return await message.channel.send({ embeds: [embed] });
            });
        } catch (err) {
            console.error(err);

            return await message.reply({
                content: `Failed to conduct search. Half our team didn't turn in today.${commandTip}`
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