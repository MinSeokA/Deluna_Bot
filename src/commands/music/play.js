// src/commands/music/play.js

const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: '재생',
        description: '음악을 재생합니다.',
        options: [
            {
                type: 3, // STRING
                name: '링크',
                description: '유튜브, 스포티파이, 사운드클라우드 등의 음악 URL을 입력하세요.',
                required: true
            }
        ]
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
        const keyword = interaction.options.getString(
            "링크"
        );

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

        if (queue) {
            if (
                interaction.guild.members.me.voice.channelId !==
                interaction.member.voice.channelId
            ) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setDescription(
                                `🚫 | 델루나와 동일한 음성 채널에 있어야 합니다!`
                            ),
                    ],
                    ephemeral: true,
                });
            }
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Aqua)
                    .setDescription(`🔍 | 노래를 찾는 중...`),
            ],
            ephemeral: true,
        });

        await client.music.play(voiceChannel, keyword, {
            textChannel: interaction.channel,
            member: interaction.member,
        });
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setDescription(`🔍 | 검색 성공!`),
            ],
            ephemeral: true,
        });
    },
}).toJSON();
