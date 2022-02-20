const { Permissions } = require('discord.js');

// >> Permissions << //
function GetPermissionName(p) {
    switch (p) {
        case Permissions.FLAGS.ADD_REACTIONS: return "ADD_REATIONS"
        case Permissions.FLAGS.ADMINISTRATOR: return "ADMINISTRATOR"
        case Permissions.FLAGS.ATTACH_FILES: return "ATTACH_FILES"
        case Permissions.FLAGS.BAN_MEMBERS: return "BAN_MEMBERS"
        case Permissions.FLAGS.CHANGE_NICKNAME: return "CHANGE_NICKNAME"
        case Permissions.FLAGS.CONNECT: return "CONNECT"
        case Permissions.FLAGS.CREATE_INSTANT_INVITE: return "CREATE_INSTANT_INVITE"
        case Permissions.FLAGS.CREATE_PRIVATE_THREADS: return "CREATE_PRIVATE_THREADS"
        case Permissions.FLAGS.CREATE_PUBLIC_THREADS: return "CREATE_PUBLIC_THREADS"
        case Permissions.FLAGS.DEAFEN_MEMBERS: return "DEAFEN_MEMBERS"
        case Permissions.FLAGS.EMBED_LINKS: return "EMBED_LINKS"
        case Permissions.FLAGS.KICK_MEMBERS: return "KICK_MEMBERS"
        case Permissions.FLAGS.MANAGE_CHANNELS: return "MANAGE_CHANNELS"
        case Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS: return "MANAGE_EMOJIS_AND_STICKERS"
        case Permissions.FLAGS.MANAGE_GUILD: return "MANAGE_GUILD"
        case Permissions.FLAGS.MANAGE_MESSAGES: return "MANAGE_MESSAGES"
        case Permissions.FLAGS.MANAGE_NICKNAMES: return "MANAGE_NICKNAMES"
        case Permissions.FLAGS.MANAGE_ROLES: return "MANAGE_ROLES"
        case Permissions.FLAGS.MANAGE_THREADS: return "MANAGE_THREADS"
        case Permissions.FLAGS.MANAGE_WEBHOOKS: return "MANAGE_WEBHOOKS"
        case Permissions.FLAGS.MENTION_EVERYONE: return "MENTION_EVERYONE"
        case Permissions.FLAGS.MODERATE_MEMBERS: return "MODERATE_MEMBERS"
        case Permissions.FLAGS.MOVE_MEMBERS: return "MOVE_MEMBERS"
        case Permissions.FLAGS.MUTE_MEMBERS: return "MUTE_MEMBERS"
        case Permissions.FLAGS.PRIORITY_SPEAKER: return "PRIORITY_SPEAKER"
        case Permissions.FLAGS.READ_MESSAGE_HISTORY: return "READ_MESSAGE_HISTORY"
        case Permissions.FLAGS.REQUEST_TO_SPEAK: return "REQUEST_TO_SPEAK"
        case Permissions.FLAGS.SEND_MESSAGES: return "SEND_MESSAGES"
        case Permissions.FLAGS.SEND_MESSAGES_IN_THREADS: return "SEND_MESSAGES_IN_THREADS"
        case Permissions.FLAGS.SEND_TTS_MESSAGES: return "SEND_TTS_MESSAGES"
        case Permissions.FLAGS.SPEAK: return "SPEAK"
        case Permissions.FLAGS.START_EMBEDDED_ACTIVITIES: return "START_EMBEDDED_ACTIVITIES"
        case Permissions.FLAGS.STREAM: return "STREAM"
        case Permissions.FLAGS.USE_APPLICATION_COMMANDS: return "USE_APPLICATION_COMMANDS"
        case Permissions.FLAGS.USE_EXTERNAL_EMOJIS: return "USE_EXTERNAL_EMOJIS"
        case Permissions.FLAGS.USE_EXTERNAL_STICKERS: return "USE_EXTERNAL_STICKERS"
        case Permissions.FLAGS.USE_PRIVATE_THREADS: return "USE_PRIVATE_THREADS"
        case Permissions.FLAGS.USE_PUBLIC_THREADS: return "USE_PUBLIC_THREADS"
        case Permissions.FLAGS.USE_VAD: return "USE_VAD"
        case Permissions.FLAGS.VIEW_AUDIT_LOG: return "VIEW_AUDIT_LOG"
        case Permissions.FLAGS.VIEW_CHANNEL: return "VIEW_CHANNEL"
        case Permissions.FLAGS.VIEW_GUILD_INSIGHTS: return "VIEW_GUILD_INSIGHTS"
    }
}

function TestForPermissions(currentPermissions, required) {
    if (Array.isArray(required)) {
        let unavailable = [];

        required.forEach(p => {
            if (!currentPermissions.has(p))
                unavailable.push(`\`${GetPermissionName(p)}\``);
        });

        return {
            passed: (unavailable.length > 0) ? false : true,
            requiredPermissions: unavailable.join(", ") || ""
        }
    } else {
        let unavailable;

        if (!currentPermissions.has(required))
            unavailable = GetPermissionName(required);

        return {
            passed: (unavailable) ? false : true,
            requiredPermissions: unavailable || ""
        }
    }
}

// >> Channels << //
async function SetMultipleChannelPermissions(channel, permissions = []) {
    await permissions.forEach(async p => 
        await channel.permissionOverwrites.edit(perm.role, perm.value)
    );
}

async function FetchAndDeleteMessagesInChannel(channel, replyID, amount, includesFilter = null, fromMember = null) {
    let purgedAmount;

    // Fetch the last 100 messages in the current channel
    await channel.messages.fetch({ limit: 100 }).then(async messages => {
        // Filter out the bot's replied message
        // and cut the array length down to the amount the user actually wanted to delete
        // also check if we should filter by a specific guild member
        if (fromMember && includesFilter)
            messages = messages.filter(msg =>
                msg.author.id === fromMember.id
                && msg.content.toLowerCase().includes(includesFilter.toLowerCase())
                && msg.id != replyID
            ).map(m => m).slice(0, amount);

        else if (fromMember)
            messages = messages.filter(msg =>
                msg.author.id === fromMember.id
                && msg.id != replyID
            ).map(m => m).slice(0, amount);

        else if (includesFilter)
            messages = messages.filter(msg =>
                msg.content.toLowerCase().includes(includesFilter.toLowerCase())
                && msg.id != replyID
            ).map(m => m).slice(0, amount);

        else
            messages = messages.filter(msg => msg.id != replyID).map(m => m).slice(0, amount);


        // Go through each message in the array and delete it from the channel
        await channel.bulkDelete(messages);
        purgedAmount = messages.length;
    });

    return purgedAmount;
}

async function GetChannelFromNameOrID(guild, id) {
    let guildChannels = await guild.channels.fetch();

    return await guildChannels.find(c =>
        c.name.toLowerCase().includes(id)
        || c.id === id
    ) || null;
}

// >> Members << //
async function GetMemberFromNameOrID(guild, id) {
    let guildMembers = await guild.members.fetch();

    return await guildMembers.find(m =>
        m.user.username.toLowerCase().includes(id)
        || m.displayName.toLowerCase().includes(id)
        || m.id === id
    ) || null;
}

// >> Roles << //
async function GetRoleFromNameOrID(guild, id) {
    let guildRoles = await guild.roles.fetch();

    return await guildRoles.find(r =>
        r.name.toLowerCase().includes(id)
        || r.id === id
    ) || null;
}

module.exports = {
    TestForPermissions: TestForPermissions,
    GetPermissionName: GetPermissionName,

    SetMultipleChannelPermissions: SetMultipleChannelPermissions,
    FetchAndDeleteMessagesInChannel: FetchAndDeleteMessagesInChannel,
    GetChannelFromNameOrID: GetChannelFromNameOrID,

    GetMemberFromNameOrID: GetMemberFromNameOrID,

    GetRoleFromNameOrID: GetRoleFromNameOrID
}