// Display a server member's avatar.

const { MessageEmbed } = require('discord.js');

const { GetMemberFromNameOrID } = require('../../modules/guildTools');
const { RandomChoice } = require('../../modules/jsTools');
const { AVATAR } = require('../../configs/commandMessages.json');

const cmdName = "avatar";
const aliases = [];

const description = "Display a server member's avatar.";

module.exports = {
    name: cmdName,
    aliases: aliases,
    description: description,

    execute: async (client, message, commandData) => {
        let guildMember = message.mentions.members.first() || null;

        // If the (member) argument wasn't a mention or it was a name/nickname/userID try to find the user in the server
        // and if the user doesn't exist just show the avatar of the current user
        if (!guildMember && commandData.args[0]) {
            let fetchedMember = await GetMemberFromNameOrID(message.guild, commandData.args[0].toLowerCase());

            if (fetchedMember.user) guildMember = fetchedMember;
            else return await message.reply({
                content: "I can't see your imaginary friends, dude. Mention someone who actually exists."
            });
        } else if (!guildMember && !commandData.args[0])
            guildMember = message.member;

        let avatar_128 = guildMember.user.displayAvatarURL({ dynamic: true, size: 128 });
        let avatar_256 = guildMember.user.displayAvatarURL({ dynamic: true, size: 256 });
        let avatar_512 = guildMember.user.displayAvatarURL({ dynamic: true, size: 512 });
        let avatar_1024 = guildMember.user.displayAvatarURL({ dynamic: true, size: 1024 });

        let embedAccentColor = (await message.guild.members.fetch(guildMember.id)).displayHexColor.replace("#", "");
        let displayingSelf = message.author.id === guildMember.user.id;

        let embed = new MessageEmbed()
            .setAuthor({ name: guildMember.displayName, url: guildMember.user.avatarURL() })
            .setDescription(`[128px](${avatar_128}) - [256px](${avatar_256}) - [512px](${avatar_512}) - [1024px](${avatar_1024})`)
            .setImage(avatar_1024)
            .setFooter({ text: displayingSelf ? RandomChoice(AVATAR.me) : RandomChoice(AVATAR.other) })
            .setColor(embedAccentColor);

        message.channel.send({ embeds: [embed] });
    }
}