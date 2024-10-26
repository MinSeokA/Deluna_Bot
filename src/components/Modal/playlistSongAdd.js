const { ModalSubmitInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const ytdl = require("ytdl-core");

module.exports = new Component({
  customId: 'playlistSongAdd',
  type: 'modal',
  /**
   * 
   * @param {DiscordBot} client 
   * @param {ModalSubmitInteraction} interaction 
   */
  run: async (client, interaction) => {
    // 모달에서 입력된 값 가져오기
    const playlistName = interaction.fields.getTextInputValue('playlist-name-Add');
    const url = interaction.fields.getTextInputValue('song-url');
    const voiceChannel = interaction.member.voice.channel;

    const player = await client.music.getPlayer(interaction.guildId) || await client.music.createPlayer({
      guildId: interaction.guildId,
      voiceChannelId: voiceChannel,
      textChannelId: interaction.channelId,
      selfDeaf: true,
      selfMute: false,
      volume: `100`,  // 기본 볼륨
    });

    // 사용자에게 응답
    // 플레이리스트에 노래 추가
    if (url.startsWith("https://www.youtube.com/playlist")) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`🚫 | 플레이리스트 링크는 사용할 수 없습니다.`),
        ],
        ephemeral: true,
      });
    }

      const info = await ytdl.getInfo(url); // YouTube 비디오 정보 가져오기

      const res = await player.search(url, interaction.user.username);

      let trackStrings = [];
      let count = 0;
      

      if (res.loadType === "playlist") {
        trackStrings = res.tracks.map(track => track.encoded)
        count = res.tracks.length
      } else if (res.loadType === "track") {
        trackStrings = [res.tracks[0].encoded]
        count = 1
      } else if (res.loadType === "search") {
        trackStrings = [res.tracks[0].encoded]
        count = 1
      }

      result = await client.api.postData("playlist/addSong", {
        playlistName: playlistName,
        song: {
          url: trackStrings,
          title: info.videoDetails.title,
          duration: info.videoDetails.lengthSeconds,
          songId: generateRandomId(8)
        }
      });

      if (result && result.status) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Green)
              .setDescription(`✅ | 플레이리스트 **${playlistName}**에 노래를 추가했습니다!`),
          ],
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Red)
              .setDescription(`🚫 | ${result.message || `플레이리스트 **${playlistName}**에 노래를 추가하지 못했습니다!`}`),
          ],
          ephemeral: true,
        });
      }



  }
}).toJSON();

function generateRandomId(length) {
  return Math.random().toString(36).substring(2, 2 + length); // 2번째 인덱스부터 길이만큼 잘라냅니다.
}
