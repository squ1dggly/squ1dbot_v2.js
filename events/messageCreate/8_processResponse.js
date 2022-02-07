// Checks for keywords inside a user's message and chooses a response to them.

const { userMention, memberNicknameMention } = require('@discordjs/builders');
const { RandomChoice } = require('../../modules/jsTools');

const { keywords, responses } = require('../../configs/autoResponseList.json');

module.exports = {
    name: "Process Response",
    event: "messageCreate",

    execute: async (client, message, guildData) => {
        // Prevents the bot from replying to itself
        if (message.author.id === client.user.id) return;

        let client_mentions = [userMention(client.user.id), memberNicknameMention(client.user.id)];
        let client_nickname = message.guild.me.nickname || null;
        if (client_nickname) client_nickname = client_nickname.toLowerCase();
        let client_displayName = message.guild.me.displayName || null;
        if (client_displayName) client_displayName = client_displayName.toLowerCase();

        let conditions = [client_displayName, client_nickname, client_mentions[0], client_mentions[1]];
        let wasMentioned = conditions.some(c => message.content.toLowerCase().includes(c));

        // If the bot was either tagged or it's name/nickname was in the user's message
        // pick the appropriate response to whatever the first keyword was in the user's message
        if (wasMentioned) {
            let response = DetermineResponse(message, guildData);

            if (response)
                message.reply({ content: response, allowedMentions: { repliedUser: false } });
        }
    }
}

// >> Custom Functions
function DetermineResponse(message, guildData) {
    let messageContent = message.content.toLowerCase();

    let keywordUsed; keywords.some(kwrds => keywordUsed = kwrds.find(kwrd => messageContent.includes(kwrd)));
    if (!keywordUsed) return;

    let keywordIndex = keywords.findIndex(kwrds => kwrds.some(kwrd => kwrd === keywordUsed));

    return RandomChoice(responses[keywordIndex])
        .replace("$TAGUSER", `${message.author}`)
        .replace("$USERDISPLAYNAME", `${message.member.displayName}`)
        .replace("$USERNICK", `${message.member.nickname}`)
        .replace("$CLIENTPREFIX", guildData.guildPrefixes[0])
        .replace("$CLIENTDISPLAYNAME", message.guild.me.displayName)
        .replace("$CLIENTNICK", message.guild.me.nickname);
}