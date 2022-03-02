// Templates useful for the cleaner creation of more complicated embeds used in some commands.

const { MessageEmbed } = require('discord.js');
const { embedColor } = require('../configs/clientSettings.json');

module.exports = {
    urban_CS: (query, queryLimit = 1) => {
        // Cut the (query.definitions) array down to the user specified limit
        query.definitions = query.definitions.slice(0, queryLimit);

        // Create an empty array in our query object so we can push the formatted definitions to this
        query.formattedDefs = [];

        // Create a blank embed setting the title and embed color
        let embed = new MessageEmbed()
            .setTitle(`Urban Definition of ***${query.searchedTerm}***`)
            .setColor(embedColor.MAIN);

        // Defines our maximum character count and the current definition index number
        let maxCharCount = 900;
        let totalCharCount = 0;
        let definitionIndex = 1;

        query.definitions.some(def => {
            // If our total character count is greater than or equal to our max character count break out of the (for loop)
            if (totalCharCount >= maxCharCount) {
                let remainder;

                // If we haven't gone through all the definitions before reaching this point
                // let the user know that we hit the maximum discord character count
                if (definitionIndex < query.definitions.length - 1) {
                    remainder = (query.definitions.length - definitionIndex);

                    embed.setFooter({
                        text: `the remaining $REMAINDER $DYNAMICDEF exceed the max character limit`
                            .replace("$REMAINDER", remainder)
                            .replace("$DYNAMICDEF", remainder > 1 ? "definitions" : "definition")
                            .replace("$DYNAMICEXC", remainder > 1 ? "exceed" : "exceeds")
                    });
                }

                return remainder;
            }

            // Check if this definition is greater than our maximum character count and formats it if it is
            totalCharCount += def.definition.length;
            if (totalCharCount > maxCharCount) {
                totalCharCount -= def.definition.length;

                def.definition = def.definition.slice(0, maxCharCount - (def.definition.length - 1))
                    + `... [read more.](${def.permalink})`;

                totalCharCount += def.definition.length + 35;
            }

            // Check if this definition's example is greater than our maximum character count and formats it if it is
            totalCharCount += def.example.length;
            if (totalCharCount > maxCharCount) {
                totalCharCount -= def.example.length;

                def.example = def.example.slice(0, maxCharCount - (def.example.length - 1))
                    + `... [read more.](${def.permalink})`;

                totalCharCount += def.example.length + 32;
            }

            // Adds a new entry if it didn't already exist from the previous loop and sets it to our current (definitionIndex)
            def.current_index = definitionIndex;

            // Push the new formatted definition to the (query.formattedDefs) array that we set at the top of this function
            query.formattedDefs.push(def);

            // Increase our current array index count by 1
            definitionIndex++;
        });

        // Now we go through the new formatted definition array
        query.formattedDefs.forEach(def => {
            // Adds a field to the embed with the current definition's, well... Definition
            embed.addField(`Definition ${def.current_index} of ${query.formattedDefs.length}`, def.definition);

            // Adds a field underneath the above field for the current definition's example
            // embed.addField("Example:", `\`\`\`${def.example}\`\`\``);
            embed.addField("Example:", `*${def.example}*`);

            // Adds a field beneath the above definition and definition example fields
            // for the current definitions like and dislike count along with the link to the Urban Dictionary website
            // that has these definition
            embed.addField(
                "\u200b",
                `Author: **[${def.author}](${def.permalink})**\n👍 ${def.thumbs_up} || 👎 ${def.thumbs_down}`
            );
        });

        return embed;
    },

    roleEdit_CS: (data, finished = false) => {
        let activeTitle = data.selectedRoles.length > 1 ? `Bulk Editing Roles` : `Editing Role`;
        let inactiveTitle = data.selectedRoles.length > 1 ? `Multiple Roles Edited Successfully` : `Role Edited Successfully`;

        let activeDescription = "an extremely accurate description that tells you how all this shit works except it doesn't";
        let inactiveDescription = data.finishedByDelete ? `${data.selectedRoles.map(r => `${r.name}`).join("\n")}` : `${data.selectedRoles.join("\n")}`;

        let embed = new MessageEmbed()
            .setTitle(finished ? inactiveTitle : activeTitle)
            .setDescription(finished ? inactiveDescription : activeDescription)
            .setColor(finished ? embedColor.APPROVED : embedColor.CONFIG);

        if (finished)
            embed.setTimestamp(data.message.createdAt);
        else
            embed.addField(`Selected Roles (${data.selectedRoles.length}):`, `${data.selectedRoles.join("\n")}`);

        embed.addField(`Audit (${data.audit.length}):`, `\`${data.audit.length > 0 ? data.audit.join("\n") : "None"}\``);

        return embed;
    }
}