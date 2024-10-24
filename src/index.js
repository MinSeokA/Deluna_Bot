require('dotenv').config();
const fs = require('fs');
const DiscordBot = require('./client/DiscordBot');
const { PlayerEvents } = require('./utils/Lavalink');

fs.writeFileSync('./terminal.log', '', 'utf-8');
const client = new DiscordBot();

module.exports = client;

client.connect();
client.on("raw", data => client.music.sendRawData(data.d));



process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);