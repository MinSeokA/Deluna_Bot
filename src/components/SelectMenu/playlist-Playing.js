const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const { EmbedBuilder, Colors } = require("discord.js");
const { info } = require("../../utils/Console");

module.exports = new Component({
  customId: 'playlist.play.select',
  type: 'select',
  /**
   * 
   * @param {DiscordBot} client 
   * @param {import("discord.js").AnySelectMenuInteraction} interaction 
   */
  run: async (client, interaction) => {
    await interaction.deferUpdate({ ephemeral: true });
    const playlistName = interaction.values[0];
    const voiceChannel = interaction.member.voice.channel;
    
    if (!voiceChannel) {
      return interaction.editReply({
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

    const player = await client.music.getPlayer(interaction.guildId) || await client.music.createPlayer({
      guildId: interaction.guildId,
      voiceChannelId: voiceChannel.id,
      textChannelId: interaction.channelId,
      selfDeaf: true,
      selfMute: false,
      volume: `100`,  // 기본 볼륨
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Aqua)
          .setDescription(`🔍 | 플레이리스트에 등록된 노래 찾는 중...`),
      ],
      ephemeral: true,
    });

    
    result = await client.api.getData(`playlist/get/${playlistName}`);
    const songs = result.data.songs.map(song => song.url); // URL만 추출

    await player.connect(); // 음성 채널에 연결

    const nodes = client.music.nodeManager.leastUsedNodes();
    const node = nodes[Math.floor(Math.random() * nodes.length)];

    // Base64 문자열 배열을 그대로 전달
    const encodedStrings = songs.map(song => {
      // JSON 문자열이 아니라 단순히 Base64 문자열을 리턴
      return song.replace(/^{|"|}$/g, ''); // 중괄호와 따옴표 제거
    });

    const tracks = await node.decode.multipleTracks(encodedStrings, interaction.user.username);

    if (tracks.length === 0) {
      embed.setColor(Colors.Red)
      embed.setDescription(`🚫 | 플레이리스트 **${playlistName}**에 노래가 없습니다!`);
    }

    player.queue.add(tracks);


    await player.setVolume(100);
    player.set("autoplay", false);

    if (!player.playing && !player.paused || player.queue.tracks.length > 0) {
      await player.play({ paused: false }); // 플레이어가 정지 상태일 때만 플레이 시작
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`✅ | 플레이리스트 **${playlistName}**를 재생합니다!`),
      ],
      ephemeral: true,
    });

  }
}).toJSON();
