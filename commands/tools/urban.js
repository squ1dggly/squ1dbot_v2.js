// Search the urban dictionary for a definition.

const fetch = require('node-fetch');

const { urban_CS } = require('../../embed_styles/commandStyles');
const { RandomChoice, RandomChance } = require('../../modules/jsTools');
const { urbanCommandTip, urbanEmptyResults } = require('../../configs/commandMessages.json');

const cmdName = "urban";
const aliases = [];

const description = "Search the urban dictionary for a definition.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        let commandTip = (RandomChance(3) ? "\n\n$TIP" : "").replace(
            "$TIP",
            `Tip: You can view more than 1 definition by adding a comma (,) and then the number of definitions you want.
                Example: \`${RandomChoice(urbanCommandTip)
                .replace("$PRFX", commandData.guildData.guildPrefixes[0])
                .replace("$CMDNAME", cmdName)
            }\``
        );

        if (!commandData.args[0]) return await message.reply({
            content: `You imbecile. What am I even supposed to search?${commandTip}`
        });

        let splitArgs = commandData.splitContent(",");
        let term = splitArgs[0].toLowerCase();
        let queryLimit = splitArgs[1] || 1;

        try {
            return await Search(term).then(async query => {
                if (!query) return await message.reply({
                    content: `Search results for \`${term}\` turned up empty.${RandomChoice(urbanEmptyResults)}${commandTip}`
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