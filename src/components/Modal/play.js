const { ModalSubmitInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
  customId: 'playSong',
  type: 'modal',
  /**
   * 
   * @param {DiscordBot} client 
   * @param {ModalSubmitInteraction} interaction 
   */
  run: async (client, interaction) => {
    // 모달에서 입력된 값 가져오기
    const url = interaction.fields.getTextInputValue('play-url');
    const platform = interaction.fields.getTextInputValue('play-platform');

    const voiceChannel = interaction.member.voice.channel;

    // 음성 채널이 없는 경우
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`🚫 | 이 명령어을 사용하려면 음성 채널에 있어야 합니다!`),
        ],
        ephemeral: true,
      });
    }

    // 플레이어 생성
    const player = await client.music.getPlayer(interaction.guildId) || await client.music.createPlayer({
      guildId: interaction.guildId,
      voiceChannelId: voiceChannel.id,
      textChannelId: interaction.channelId,
      selfDeaf: true,
      selfMute: false,
      volume: `100`,  // 기본 볼륨
    });

    // 플레이어가 연결되어 있지 않으면 연결 시도
    await player.connect();

    player.filterManager
    if (!player.connected) {
      try {
        await player.connect();
      } catch (error) {
        console.error(error); // 연결 오류 로그
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Red)
              .setDescription(`🚫 | 음성 채널에 연결하는 동안 오류가 발생했습니다.`),
          ],
          ephemeral: true,
        });
      }
    }

    // 사용자와 봇의 음성 채널 확인
    if (player.voiceChannelId && player.voiceChannelId !== voiceChannel.id) {
      if (interaction.guild.members.me.voice.channelId !== interaction.member.voice.channelId) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Red)
              .setDescription(`🚫 | 델루나와 동일한 음성 채널에 있어야 합니다!`),
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

    // 노래 검색
    const searchResult = await player.search({ query: url, source: platform }, interaction.user.username);

    if (searchResult.loadType === 'LOAD_FAILED') {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`🚫 | 노래를 찾는 중 오류가 발생했습니다.`),
        ],
        ephemeral: true,
      });
    }

    if (searchResult.loadType === 'NO_MATCHES') {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`🚫 | 노래를 찾을 수 없습니다.`),
        ],
        ephemeral: true,
      });
    }

    const track = searchResult.tracks[0]; // 첫 번째 트랙을 선택

    await player.queue.add(track); // 트랙 추가
    player.setVolume(100);
    player.set("autoplay", false);

    if (!player.playing) {
      await player.play({ volume: `100`, paused: false });
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`✅ | **${track.info.title}** 노래가 큐에 추가되었습니다!`)
          .addFields(
            { name: '아티스트', value: track.info.author, inline: true },
            { name: '길이', value: `${track.info.duration / 1000}s`, inline: true },
            { name: '링크', value: track.info.uri, inline: false }
          )
          .setFooter({ text: `요청자: ${interaction.user.username}` }),
      ],
      ephemeral: true,
    });
  }
}).toJSON();