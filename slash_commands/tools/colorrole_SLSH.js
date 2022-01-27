// Create, edit, remove custom color roles.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const clientSettings = require('../../configs/clientSettings.json');
const mongo = require('../../modules/mongo');

const hex_validator = /^[0-9A-F]{6}$/i;

// Check if the user that called the interaction is either an (admin) or the (bot creator):
function userAdminCheck(client, interaction) {
    if (!interaction.member.permissions.has("ADMINISTRATOR"))
        if (!interaction.user.id != clientSettings.CREATOR_ID) {
            return false;
        } else return true;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("colorrole")
        .setDescription("Create, remove, or give yourself custom color roles.")
        .addSubcommand(subcommand => subcommand.setName("give").setDescription("Give yourself a role color from the available options")
            .addStringOption(option => option.setName("color-name").setDescription("Choose the color you want").setRequired(true)))

        .addSubcommand(subcommand => subcommand.setName("create").setDescription("Create a new color role")
            .addStringOption(option => option.setName("name").setDescription("The name of your new color role").setRequired(true))
            .addStringOption(option => option.setName("color").setDescription("The hex code you want your color to be").setRequired(true)))
        
        .addSubcommand(subcommand => subcommand.setName("remove").setDescription("Remove an existing color role")
            .addStringOption(option => option.setName("name").setDescription("The role to remove").setRequired(true)))

        .addSubcommand(subcommand => subcommand.setName("list").setDescription("List all available color roles")),

    execute: async (client, interaction, guild_data) => {
        const role_manager = interaction.guild.roles;

        // Give the user the color role they want if that color role exists:
        if (interaction.options.getSubcommand() == "give") {
            const role_name = interaction.options.getString("color-name");
            const role = guild_data.colorRoles.get(role_name);

            try {
                const color_role = await role_manager.fetch(role.id);
                const member_role_manager = interaction.member.roles;

                const member_roles = member_role_manager.cache.map(r => r)
                member_roles.forEach(mem_role => {
                    guild_data.colorRoles.forEach(col_role => { if (mem_role.id == col_role.id) member_role_manager.remove(mem_role); })
                });

                member_role_manager.add(color_role);
                
                interaction.reply(`You have been given the role color ${color_role}`)
                    .then(() => setTimeout(() => interaction.deleteReply(), clientSettings.MSGTIMEOUT_TASKCOMPLETED));
            } catch (err) { console.error(err); return interaction.reply({ content: "Failed to give color role.", ephemeral: true }); }
        }

        // Create color role:
        else if (interaction.options.getSubcommand() == "create") {
            if (userAdminCheck(client, interaction)) {
                const responses = clientSettings.ERRORMSG_NOADMINPERMS;
                return interaction.reply({ content: responses[Math.floor(Math.random() * responses.length)], ephemeral: true });
            }

            const role_name = interaction.options.getString("name");
            const color = interaction.options.getString("color").toLowerCase();

            if (!hex_validator.test(color)) return interaction.reply({ content: "Invalid color hex.", ephemeral: true });

            try {
                const color_role = await role_manager.create({
                    name: role_name,
                    color: color,
                    permissions: [],
                    mentionable: false,
                    reason: `${interaction.user.tag} requested a custom color role.`
                });

                const updated_guild_color_roles = guild_data.colorRoles;
                updated_guild_color_roles.set(color_role.name, {
                    id: color_role.id.toString(),
                    color: color_role.hexColor.replace("#", "")
                });

                mongo.updateGuild(interaction.guild.id, { colorRoles: updated_guild_color_roles });

                const embed = new MessageEmbed()
                    .setTitle("Created color role!")
                    .setDescription(`${color_role}`)
                    .setColor(clientSettings.embedColor.APPROVED);

                return interaction.reply({ embeds: [embed] })
                    .then(() => setTimeout(() => interaction.deleteReply(), clientSettings.MSGTIMEOUT_TASKCOMPLETED));
            } catch (err) { console.log(err); return interaction.reply({ content: "Failed to create color role.", ephemeral: true }); }
        }

        // Remove an existing color role:
        else if (interaction.options.getSubcommand() == "remove") {
            if (userAdminCheck(client, interaction)) {
                const responses = clientSettings.ERRORMSG_NOADMINPERMS;
                return interaction.reply({ content: responses[Math.floor(Math.random() * responses.length)], ephemeral: true });
            }

            const role_name = interaction.options.getString("name");
            const role = guild_data.colorRoles.get(role_name);

            try {
                const color_role = await role_manager.fetch(role.id);
                const color_role_name = color_role.name;
                
                color_role.delete();

                interaction.reply(`Removed color role **${color_role_name}**`)
                    .then(() => setTimeout(() => interaction.deleteReply(), clientSettings.MSGTIMEOUT_TASKCOMPLETED));
            } catch (err) { return interaction.reply({ content: "Invalid color role name.", ephemeral: true }); }
        }

        // List available color roles:
        else if (interaction.options.getSubcommand() == "list") {
            const guild_roles = interaction.guild.roles;
            const color_roles = [];
            
            await guild_data.colorRoles.forEach(async r => color_roles.push(await guild_roles.fetch(r.id)));
            
            let role_list = "";
            let role_count = 0;

            color_roles.forEach(r => {
                role_list += `${r}\n`;
                role_count += 1;
            });

            const embed = new MessageEmbed()
                .setTitle(`Color Roles [${role_count}]`)
                .setDescription(role_list)
                .setColor(clientSettings.embedColor.MAIN);

            interaction.reply({ embeds: [embed] });
        }
    }
}