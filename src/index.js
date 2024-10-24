require('dotenv').config();
const fs = require('fs');
const DiscordBot = require('./client/DiscordBot');
const { PlayerEvents } = require('./utils/Lavalink');

fs.writeFileSync('./terminal.log', '', 'utf-8');
const client = new DiscordBot();

module.exports = client;

client.connect();
const voiceStates = new Map();

client.on("raw", data => {
    if (data.t === "VOICE_STATE_UPDATE") {
        voiceStates.set(data.d.guild_id, {
            ...voiceStates.get(data.d.guild_id),
            sessionId: data.d.session_id,
            channelId: data.d.channel_id
        });
    } else if (data.t === "VOICE_SERVER_UPDATE") {
        const voiceState = voiceStates.get(data.d.guild_id);
        if (!voiceState) return; // VOICE_STATE_UPDATE가 먼저 와야 함

        const payload = {
            guildId: data.d.guild_id,
            playerOptions: {
                voice: {
                    token: data.d.token,
                    endpoint: data.d.endpoint,
                    sessionId: voiceState.sessionId,
                }
            }
        };

        // 실제로 player에 적용
        const player = client.music.getPlayer(data.d.guild_id);
        if (player) {
            player.node.updatePlayer(payload);
            player.connect();
        }
    }
});


process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);