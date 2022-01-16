// Basically just tells us when we've successfully connected to Discord.

module.exports = {
    name: "Connected",
    event: "Ready",

    execute: async (client) => {
        console.log("successfully connected to discord");
    }
}