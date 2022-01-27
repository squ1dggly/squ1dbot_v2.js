// Imports all slash commands found in ('../slash_commands').

const fs = require('fs');

function importSlashCommands(cmds_dir) {
    let items = fs.readdirSync(cmds_dir.substring(1));
    let slash_commands = [];

    items.forEach(item => {
        if (item.endsWith('.js')) 
            slash_commands.push(require(`${cmds_dir}/${item}`));
        else
            try {
                let cmd_folder = fs.readdirSync(`${cmds_dir.substring(1)}/${item}`).filter(fn => fn.endsWith('.js'));
                cmd_folder.forEach(fn => slash_commands.push(require(`${cmds_dir}/${item}/${fn}`)));
            } catch (err) { console.error(`Failed to import slash command \"${err.path}\"`, err); }
    });

    return slash_commands;
}

module.exports = {
    init: (client) => {
        let slash_commands = importSlashCommands('../slash_commands');

        slash_commands.forEach(cmd => {
            client.slashCommands.set(cmd.data.name, { isAdminCommand: cmd.isAdminCommand || false, data: cmd.data, execute: cmd.execute });
        });
    }
}