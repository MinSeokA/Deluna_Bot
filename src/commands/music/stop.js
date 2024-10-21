const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: '정지',
        description: '음악을 정지합니다.'
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
        const voiceChannel = interaction.member.voice.channel;
        const queue = await client.music.getQueue(interaction);

        if (!voiceChannel) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(
                            `🚫 | 이 명령어을 사용하려면 음성 채널에 있어야 합니다!`
                        ),
                ],
                ephemeral: true,
            });
        }

        if (!queue) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(
                            `🚫 | 재생 중인 음악이 없습니다!`
                        ),
                ],
                ephemeral: true,
            });
        }

        queue.stop();
        client.music.voices.leave(interaction);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setDescription(
                        `⏹️ | 음악을 정지했습니다!`
                    ),
            ],
        });
    }
}).toJSON();