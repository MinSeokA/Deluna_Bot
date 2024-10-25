const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const { EmbedBuilder, Colors } = require("discord.js");

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

        await interaction.deferUpdate(); // 선택한 항목을 처리하는 동안 대기

        // 플레이어 가져오기
        const player = client.music.getPlayer(interaction.guildId);
        if (!player) {
            return interaction.editReply({ content: "플레이어가 존재하지 않습니다.", ephemeral: true, embeds: [], components: [] });
        }

        // 선택한 트랙 찾기
        const selectedTrack = player.queue.tracks.find(track => track.info.identifier === selectedTrackValue);
        if (!selectedTrack) {
            return interaction.editReply({ content: "선택한 트랙을 찾을 수 없습니다.", ephemeral: true, embeds: [], components: [] });
        }

        // 이전 트랙이 존재하면 이전 트랙을 재생목록에 추가
        await player.stopPlaying();
        // 선택한 트랙을 재생
        const previousTrack = player.queue.tracks.toString();
        // 이전 트랙을 재생목록에 추가
        console.log(previousTrack); 
        await player.queue.add(previousTrack);

        // 선택한 트랙을 재생
        // 선택한 트랙을 재생목록 맨 앞에 추가
        await player.play({
            track: selectedTrack,
            requester: interaction.user.username
        });

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setDescription(`
                    ✅ | 선택한 트랙을 재생합니다.
                    
                    🎶 [${selectedTrack.info.title}](${selectedTrack.info.uri}) - \`${selectedTrack.info.author}\`
                    `)
                    .setThumbnail(selectedTrack.info.artworkUrl)

            ],
            ephemeral: true
        });
    }
}).toJSON();
