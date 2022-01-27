// Keeps chats clean by preventing scam links from staying in chat.

const { getGuildData } = require('../../import_handlers/eventHandler');
const clientSettings = require('../../configs/clientSettings.json');
const auditLogger = require('../../modules/auditLogger');

const scamKeywords = require('./../../configs/scamKeywords.json');

// TODO: this should be a try statement
async function kickMemberFromAllGuilds(client, user_id) {
    let guilds = await client.guilds.fetch();

    guilds.forEach(async guild => {
        let guild_data = await getGuildData(client, guild.id);
        let guild_member = await guild.members.fetch(user_id);

        if (guild_member) {
            guild_member.kick("Attempting to scam in dms");
            auditLogger.logMemberKick(client, guild_member, guild_data, "attempting to scam in dms");
        }
    });
}

function checkForScamLink(message) {
    let content = message.content.toLowerCase();
    let has_link = ["https://", "http://"].some(c => content.includes(c));
    let is_scam = false;

    if (has_link)
        scamKeywords.links.some(link_style => {
            if (content.includes(link_style)) {
                is_scam = true;
                return true;
            }
        });

    return is_scam;
}

function determineScamByKeywords(message) {
    let content = message.content.toLowerCase();
    let split_content = content.split(" ");
    
    let keyword_count = 0;

    split_content.forEach(word => {
        scamKeywords.nitroScamKeywords.forEach(style => { if (style == word) keyword_count++; });
    });

    if (message.author.bot)
        if (keyword_count >= 4) return true; else return false;
    else
        if (keyword_count >= 6) return true; else return false;
}

module.exports = {
    name: "Filter Scammers",
    event: "messageCreate",

    execute: async (client, message) => {
        if (message.author.id == client.user.id) return;

        if (message.guild) {
            if (checkForScamLink(message)) {
                message.delete();
                message.channel.send(`${message.author} Hey, dumbass... Scamming isn't allowed here.`)
                    .then(msg => setTimeout(() => msg.delete(), clientSettings.MSGTIMEOUT_QUICKNOTIF))
                    .catch(console.error);

                return;
            }
        } else {
            if (checkForScamLink(message)) return kickMemberFromAllGuilds(client, message.author.id);
            else if (determineScamByKeywords(message)) return kickMemberFromAllGuilds(client, message.author.id);
        }
    }
}