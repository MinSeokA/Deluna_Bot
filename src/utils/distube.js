const client = require("../index.js");
const { EmbedBuilder, Colors } = require("discord.js");

const Format = Intl.NumberFormat();

const status = (queue) =>
    `볼륨: \`${queue.volume}%\` | 필터: \`${
        queue.filters.names.join(", ") || "없음"
    }\` | 반복: \`${
        queue.repeatMode
            ? queue.repeatMode === 2
                ? "재생목록"
                : "곡"
            : "꺼짐"
    }\` | 자동재생: \`${queue.autoplay ? "켜짐" : "꺼짐"}\``;

client.music.on("addSong", async (queue, song) => {
    const msg = await queue.textChannel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Green)
                .setAuthor({
                    name: "재생목록에 곡 추가됨",
                    iconURL: client.user.avatarURL(),
                })
                .setDescription(`> [**${song.name}**](${song.url})`)
                .setThumbnail(song.user.displayAvatarURL())
                .addFields([
                    {
                        name: "⏱️ | 시간",
                        value: `${song.formattedDuration}`,
                        inline: true,
                    },
                    {
                        name: "🎵 | 업로더",
                        value: `[${song.uploader.name}](${song.uploader.url})`,
                        inline: true,
                    },
                    {
                        name: "👌 | 요청자",
                        value: `${song.user}`,
                        inline: true,
                    },
                ])
                .setImage(song.thumbnail)
                .setFooter({
                    text: `${Format.format(queue.songs.length)} 곡이 대기 중입니다.`,
                }),
        ],
    });

    setTimeout(() => {
        msg.delete();
    }, 20000);
});


client.music.on("addList", async (queue, playlist) => {
    console.log(playlist);
    console.log(queue);
    const msg = await queue.textChannel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Green)
                .setAuthor({
                    name: "재생목록에 플레이리스트 추가됨",
                    iconURL: client.user.avatarURL(),
                })
                .setThumbnail(playlist.user.displayAvatarURL())
                .setDescription(`> 플레이리스트 재생 중...`)
                .addFields([
                    {
                        name: "⏱️ | 시간",
                        value: `${playlist.formattedDuration}`,
                        inline: true,
                    },
                    {
                        name: "👌 | 요청자",
                        value: `${playlist.user}`,
                        inline: true,
                    },
                ])
                .setImage(playlist.thumbnail)
                .setFooter({
                    text: `${Format.format(queue.songs.length)} 곡이 대기 중입니다.`,
                }),
        ],
    });

    setTimeout(() => {
        msg.delete();
    }, 20000);
});

client.music.on("playSong", async (queue, song) => {
    const msg = await queue.textChannel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Green)
                .setAuthor({
                    name: "현재 재생 중",
                    iconURL: client.user.avatarURL(),
                })
                .setDescription(`> [**${song.name}**](${song.url})`)
                .setThumbnail(song.user.displayAvatarURL())
                .addFields([
                    {
                        name: "🔷 | 상태",
                        value: `${status(queue).toString()}`,
                        inline: false,
                    },
                    {
                        name: "👀 | 조회수",
                        value: `${Format.format(song.views)}`,
                        inline: true,
                    },
                    {
                        name: "👍 | 좋아요",
                        value: `${Format.format(song.likes)}`,
                        inline: true,
                    },
                    {
                        name: "⏱️ | 시간",
                        value: `${song.formattedDuration}`,
                        inline: true,
                    },
                    {
                        name: "🎵 | 업로더",
                        value: `[${song.uploader.name}](${song.uploader.url})`,
                        inline: true,
                    },
                    {
                        name: "👌 | 요청자",
                        value: `${song.user}`,
                        inline: true,
                    },
                    {
                        name: "📻 | 음악 재생 위치",
                        value: `
┕🔊 | ${client.channels.cache.get(queue.voiceChannel.id)}
┕🪄 | ${queue.voiceChannel.bitrate / 1000} kbps`,
                        inline: false,
                    },
                    {
                        name: "🤖 | 추천 곡",
                        value: `[${song.related[0].title}](https://www.youtube.com/watch?v=${song.related[0].id})
┕🆙 | 업로더: [${song.related[0].author.user}](${song.related[0].author.channel_url})`,
                        inline: false,
                    },
                ])
                .setImage(song.thumbnail)
                .setFooter({
                    text: `${Format.format(queue.songs.length)} 곡이 대기 중입니다.`,
                }),
        ],
    });

    setTimeout(() => {
        msg.delete();
    }, 1000 * 60 * 2);
});

client.music.on("empty", async (queue) => {
    const msg = await queue.textChannel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(
                    `🚫 | 방이 비어있습니다. 봇이 자동으로 방을 나갑니다!`
                ),
        ],
    });
    setTimeout(() => {
        msg.delete();
    }, 20000);
});

client.music.on("disconnect", async (queue) => {
    const msg = await queue.textChannel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(`🚫 | 봇이 음성 채널에서 연결이 끊겼습니다!`),
        ],
    });
    setTimeout(() => {
        msg.delete();
    }, 20000);
});

client.music.on("finish", async (queue) => {
    const msg = await queue.textChannel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(
                    `🚫 | 재생목록의 모든 곡이 재생되었습니다!`
                ),
        ],
    });
    setTimeout(() => {
        msg.delete();
    }, 20000);
});

client.music.on("initQueue", async (queue) => {
    queue.autoplay = true;
    queue.volume = 100;
});

client.music.on("noRelated", async (queue) => {
    const msg = await queue.textChannel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(`🚫 | 곡을 찾을 수 없습니다!`),
        ],
    });
    setTimeout(() => {
        msg.delete();
    }, 20000);
});
