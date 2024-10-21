const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

// 플레이리스트 저장 [플레이리스트이름] 명령어를 생성합니다.
// 플레이리스트 재생 [플레이리스트이름] 명령어를 생성합니다.
// 플레이리스트 삭제 [플레이리스트이름] 명령어를 생성합니다.
module.exports = new ApplicationCommand({
  command: {
    name: '플레이리스트',
    description: '플레이리스트를 관리합니다.',
    type: 1,
    options: [
      {
        type: 1, // Subcommand
        name: '생성',
        description: '플레이리스트를 생성합니다.',
        options: [
          {
            type: 3, // STRING
            name: '이름',
            description: '플레이리스트 이름을 입력하세요.',
            required: true
          }
        ]
      },
      {
        type: 1, // Subcommand
        name: '재생',
        description: '플레이리스트를 재생합니다.',
        options: [
          {
            type: 3, // STRING
            name: '이름',
            description: '플레이리스트 이름을 입력하세요.',
            required: true
          }
        ]
      },
      {
        type: 1, // Subcommand
        name: '삭제',
        description: '플레이리스트를 삭제합니다.',
        options: [
          {
            type: 3, // STRING
            name: '이름',
            description: '플레이리스트 이름을 입력하세요.',
            required: true
          }
        ]
      },
      {
        type: 1, // Subcommand
        name: '추가',
        description: '플레이리스트에 노래를 추가합니다.',
        options: [
          {
            type: 3, // STRING
            name: '이름',
            description: '플레이리스트 이름을 입력하세요.',
            required: true
          },
          {
            type: 3, // STRING
            name: 'url',
            description: '유튜브 링크 또는 스포티파이, 사운드클라우드 등의 음악 URL을 입력하세요.',
            required: true
          }
        ]
      },
      {
        type: 1, // Subcommand
        name: '목록',
        description: '개인 플레이리스트 목록을 확인합니다.',
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
    const subcommand = interaction.options.getSubcommand();
    const playlistName = interaction.options.getString("이름");
    const url = interaction.options.getString("url");
    let result;

    let embed = new EmbedBuilder()
    switch (subcommand) {
      case "생성":

        result = await client.api.postData("playlist/create", {
          name: playlistName,
          userId: interaction.user.id
        });

        if (result && result.status) {
          embed.setColor(Colors.Green)
          embed.setDescription(`✅ | 플레이리스트 **${playlistName}**를 생성했습니다!`);
        } else {
          embed.setColor(Colors.Red)
          embed.setDescription(`🚫 | ${result.message || `플레이리스트 **${playlistName}**를 생성하지 못했습니다!`}`);
        }
        // 플레이리스트를 생성합니다.
        break;
      case "추가":
        result = await client.api.postData("playlist/addSong", {
          playlistName: playlistName,
          song: {
            url: url,
            songId: generateRandomId(8)
          }
        });

        if (result && result.status) {
          embed.setColor(Colors.Green)
          embed.setDescription(`✅ | 플레이리스트 **${playlistName}**에 노래를 추가했습니다!`);
        } else {
          embed.setColor(Colors.Red)
          embed.setDescription(`🚫 | ${result.message || `플레이리스트 **${playlistName}**에 노래를 추가하지 못했습니다!`}`);
        }
        // 플레이리스트를 생성합니다.
        break;
      case "목록":
        result = await client.api.getData(`playlist/${interaction.user.id}`);

        console.log(result);
        if (result && result.status) {
          embed.setColor(Colors.Green)
          embed.setDescription(`✅ | 플레이리스트 목록을 불러왔습니다!`);
          embed.addFields(
            {
              name: "플레이리스트",
              value: result.data.map((playlist, index) => {
                return `**${index + 1}.** ${playlist.name} - \`${playlist.songs.length ? playlist.songs.length : "0"}개의 노래\``;
              }).join("\n")
            }
          )
        } else {
          embed.setColor(Colors.Red)
          embed.setDescription(`🚫 | ${result.message || `플레이리스트 목록을 불러오지 못했습니다!`}`);
        }
        // 플레이리스트를 생성합니다.
        break;
      case "재생":
        result = await client.api.getData(`playlist/get/${playlistName}`);

        const songs = result.data.songs.map(song => song.url); // URL만 추출

        if (songs.length > 0) {
          const playlist = await client.music.createCustomPlaylist(songs);
          await client.music.play(interaction.member.voice.channel, playlist, {
            textChannel: interaction.channel,
            member: interaction.member,
          });

          embed.setColor(Colors.Green);
          embed.setDescription(`✅ | 플레이리스트 **${playlistName}**를 재생합니다!`);
        } else {
          embed.setColor(Colors.Red);
          embed.setDescription(`🚫 | 플레이리스트에 유효한 노래가 없습니다.`);
        }
        break;
      case "삭제":
        // 플레이리스트를 삭제합니다.
        break;
    }

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
}).toJSON();

function generateRandomId(length) {
  return Math.random().toString(36).substring(2, 2 + length); // 2번째 인덱스부터 길이만큼 잘라냅니다.
}
