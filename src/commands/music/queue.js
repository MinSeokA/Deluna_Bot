const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: '재생목록',
        description: '현재 재생목록을 보여줍니다.'
    },
    options: {
        cooldown: 5000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const player = client.music.getPlayer(interaction.guildId);

        if (!player || player.queue.tracks.length === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(`🚫 | 재생중인 음악이 없습니다.`),
                ],
                ephemeral: true,
            });
        }

        const current = player.queue.current;

        const queueEmbed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`🎵 | 현재 재생 중인 음악: ${current?.info.title}`)
            .setDescription(
                `> **현재 재생 중인 음악**\n` +
                `> 🎶 [${current?.info.title}](${current?.info.uri}) - \`${current?.info.author}\`\n\n` +
                `> **다음 트랙들** (${player.queue.tracks.length > 20 ? "20개" : `${player.queue.tracks.length}개`}):\n` +
                player.queue.tracks.slice(0, 20)
                    .map((t, i) => `> **${i + 1}.** [${t.info.title}](${t.info.uri}) - ${t.info.author}`).join("\n")
            )
            .setFooter({
                text: `총 ${player.queue.tracks.length}개의 트랙이 대기 중입니다.`,
            })
            .setTimestamp();

        // 선택 메뉴와 버튼 추가
        await interaction.reply({
            embeds: [
                queueEmbed
            ],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 3, // String Select Menu
                            custom_id: 'queue.list.select',
                            placeholder: '트랙을 선택하세요...',
                            options: player.queue.tracks.slice(0, 20).map((track, index) => ({
                                label: track.info.title,
                                value: track.info.identifier // 트랙의 고유 ID
                            }))
                        }
                    ]
                }
            ],
            ephemeral: true,
        });
    }
}).toJSON();
