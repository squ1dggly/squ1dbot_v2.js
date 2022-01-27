// Checks for trigger words inside a user's message and chooses a response to them.

const autoresTriggers = require('../../configs/autores_triggers.json').data;
const autoresResponses = require('../../configs/autores_responses.json').data;

function determineResponse(message) {
    let choices;
    let response;

    for (const t_index in autoresTriggers)
        autoresTriggers[t_index].forEach(trigger => {
            if (message.includes(trigger)) {
                choices = autoresResponses[t_index];
                response = choices[Math.floor(Math.random() * choices.length)];
            }
        });

    return response;
}

module.exports = {
    name: "Process Response",
    event: "messageCreate",

    execute: async (client, message) => {
        if (message.author.id == client.user.id) return;

        let content = message.content.toLowerCase();

        let clientMention = [`<@${client.user.id}>`, `<@!${client.user.id}>`];
        let clientNickname;

        try { clientNickname = message.guild.me.nickname.toLowerCase(); } catch { clientNickname = ""; }

        let conditions = ["squ1dbot", "squ1dboat", clientNickname, clientMention[0], clientMention[1]];
        let mentioned = conditions.some(c => content.includes(c));

        // If the user mentioned the bot in their message:
        if (mentioned) {
            let response = determineResponse(content);

            if (response) message.reply({ content: response, allowedMentions: { repliedUser: false } });
        }
    }
}