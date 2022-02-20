// Update one or more existing role all at once.

const cmdName = "roleedit";
const aliases = [];

const description = "Update one or more existing role all at once.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message) => {
        return await message.reply({
            content: "This command is currently in the process of being created.",
            allowedMentions: { repliedUser: false }
        });
    }
}