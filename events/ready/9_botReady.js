// Runs once the bot is fully connected to discord and can recieve commands

module.exports = {
    name: "Bot Ready",
    event: "Ready",

    execute: async (client) => {
        console.log("successfully connected to discord");
    }
}