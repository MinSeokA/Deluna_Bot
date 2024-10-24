const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
    customId: 'queue.list.select',
    type: 'select',
    /**
     * 
     * @param {DiscordBot} client 
     * @param {import("discord.js").AnySelectMenuInteraction} interaction 
     */
    run: async (client, interaction) => {
        const selectedTrackValue = interaction.values[0]; // 선택된 트랙 value

        // 플레이어 가져오기
        const player = client.music.getPlayer(interaction.guildId);
        if (!player) {
            return interaction.reply({ content: "플레이어가 존재하지 않습니다.", ephemeral: true });
        }

        // 선택한 트랙 찾기
        const selectedTrack = player.queue.tracks.find(track => track.info.identifier === selectedTrackValue);
        if (!selectedTrack) {
            return interaction.reply({ content: "선택한 트랙을 찾을 수 없습니다.", ephemeral: true });
        }

        // 현재 재생 중인 트랙을 멈추고 새 트랙 재생
        player.stopPlaying();

        // 새 트랙 재생
        await player.queue.tracks.unshift(selectedTrack);

        return interaction.reply({ 
            content: `✅ | [\`${selectedTrack.info.title}\`](${selectedTrack.info.uri}) 트랙이 재생됩니다.`, 
            ephemeral: true 
        });
    }
}).toJSON();
