const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: '재생목록',
        description: '대기열을 확인합니다.'
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
        const queue = await client.music.getQueue(interaction);

        if (!queue) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(
                            `🚫 | 대기열이 비어 있습니다!`
                        ),
                ],
                ephemeral: true,
            });
        }

        const songs = queue.songs.map((song, index) => {
            return `**${index + 1}.** [${song.name}](${song.url}) - \`${song.formattedDuration}\` - 요청자: ${song.user}`;
        });

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: "대기열",
                        iconURL: client.user.avatarURL(),
                    })
                    .setDescription(songs.join("\n"))
                    .setFooter({
                        text: `🎵 | ${songs.length} 곡이 대기 중입니다.`
                    })
            ]
        });
    }
}).toJSON();