// Trouble making decisions because your brain can't grasp a simple understanding? Ask the bot to pick one of 2+ choices for you.

const { RandomChance, RandomChoice } = require('../../modules/jsTools');
const { PICK } = require('../../configs/commandMessages.json');

const cmdName = "pick";
const aliases = ["choose"];

const description = "Trouble making decisions because your brain can't grasp a simple understanding? Ask the bot to pick one of 2+ choices for you.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        let args = commandData.splitContent(",");

        // If we didn't receive any options at all
        if (args.length < 1)
            return await message.channel.send("What the heck am I supposed to choose if you didn't give me any options??");

        // If the user gave us less than 2 options which completely defeats the purpose of using this command
        if (args.length < 2)
            if (RandomChance(2))
                return await message.channel.send("Are you really that indecisive that you couldn't pick between a single option?\n\nTip: seperate your options using a comma (,)");
            else
                return await message.channel.send("Are you really that indecisive that you couldn't pick between a single option?");

        // If the user didn't fail at giving us more than 1 option; pick something random and tell the user what our choice was
        let choice = RandomChoice(args);
        let response = RandomChoice(PICK);

        return await message.channel.send(`${response} ${choice}`);
    }
}