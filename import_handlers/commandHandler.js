// Imports all commands found in ('../commands').

const fs = require('fs');
const path = require('path');

function ImportAllCommands(dir, arr) {
    fs.readdirSync(dir).forEach(file => {
        let abs = path.join(dir, file);

        if (fs.statSync(abs).isDirectory())
            return ImportAllCommands(abs, arr);
        else if (abs.endsWith('.js')) {
            let cmd = require(`../${abs}`);
            if (cmd.name) return arr.push(cmd);
        }
    });
}

module.exports = {
    init: (client) => {
        let commands = [];
        ImportAllCommands('./commands', commands);

        commands.forEach(cmd => {
            client.commands.set(cmd.name, {
                name: cmd.name,
                aliases: cmd.aliases,
                description: cmd.description,
                execute: cmd.execute
            });

            if (cmd.aliases.length > 0)
                cmd.aliases.forEach(ali => {
                    client.commandAliases.set(ali, {
                        name: cmd.name,
                        alias: ali,
                        description: cmd.description,
                        execute: cmd.execute
                    });
                });
        });
    }
}