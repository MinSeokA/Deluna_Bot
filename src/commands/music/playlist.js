const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

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
        name: '정보',
        description: '플레이리스트에 추가된 노래 목록을 확인합니다.',
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
          },
          {
            type: 3, // STRING
            name: 'song_id',
            description: '노래 ID를 입력하세요. [플레이리스트 정보에서 확인 가능]',
            required: true
          }
        ]
      },
      {
        type: 1, // Subcommand
        name: '추가',
        description: '플레이리스트에 노래를 추가합니다.',
      },
      {
        type: 1, // Subcommand
        name: '목록',
        description: '개인 플레이리스트 목록을 확인합니다.',
      }
    ]
  },
  /**
   * 
   * @param {DiscordBot} client 
   * @param {ChatInputCommandInteraction} interaction 
   */
  run: async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const playlistName = interaction.options.getString("이름");
    const songId = interaction.options.getString("song_id");
    const voiceChannel = interaction.member.voice.channel;
    let result;

    let embed = new EmbedBuilder()
      .setColor(Colors.Default) // 기본 색상 설정
      .setDescription('처리 중입니다...'); // 초기 기본 description 설정


    switch (subcommand) {
      case "생성":
        // 플레이리스트를 생성합니다.
        await interaction.showModal({
          custom_id: 'playlistCreate',
          title: '플레이리스트 노래 추가',
          components: [
            {
              type: 1,  // 첫 번째 행
              components: [
                {
                  type: 4,
                  custom_id: 'playlist-name-Create',
                  label: '플레이리스트 이름',
                  max_length: 50,  // 최대 길이 조정
                  min_length: 1,    // 최소 길이 조정
                  placeholder: '플레이리스트 이름을 입력하세요!',
                  style: 1,         // 단일 줄 텍스트 필드
                  required: true,
                },
              ],
            },
          ],
        });
        break;
      case "추가":

        await interaction.showModal({
          custom_id: 'playlistSongAdd',
          title: '플레이리스트 노래 추가',
          components: [
            {
              type: 1,  // 첫 번째 행
              components: [
                {
                  type: 4,
                  custom_id: 'playlist-name-Add',
                  label: '플레이리스트 이름',
                  max_length: 50,  // 최대 길이 조정
                  min_length: 1,    // 최소 길이 조정
                  placeholder: '플레이리스트 이름을 입력하세요!',
                  style: 1,         // 단일 줄 텍스트 필드
                  required: true,
                },
              ],
            },
            {
              type: 1,  // 두 번째 행
              components: [
                {
                  type: 4,
                  custom_id: 'song-url',
                  label: '링크 또는 제목 (키워드 검색)',
                  max_length: 1_000,   // 최대 길이 조정
                  min_length: 1,    // 최소 길이 조정
                  placeholder: '링크 또는 제목을 입력하세요!',
                  style: 1,         // 단일 줄 텍스트 필드
                  required: true,
                },
              ],
            }
          ],
        });
        // 플레이리스트를 생성합니다.
        break;
      case "목록":
        result = await client.api.getData(`playlist/${interaction.user.id}`);

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
        await interaction.editReply({
          embeds: [embed],
          ephemeral: true
        });
        // 플레이리스트를 생성합니다.
        break;
      case "재생":
        const player = await client.music.getPlayer(interaction.guildId) || await client.music.createPlayer({
          guildId: interaction.guildId,
          voiceChannelId: voiceChannel.id,
          textChannelId: interaction.channelId,
          selfDeaf: true,
          selfMute: false,
          volume: `100`,  // 기본 볼륨
        });
        
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
    
        await interaction.reply({
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

        embed.setColor(Colors.Green);
        embed.setDescription(`✅ | 플레이리스트 **${playlistName}**를 재생합니다!`);
        await interaction.editReply({
          embeds: [embed],
          ephemeral: true
        });
        break;
      case "삭제":
        // 플레이리스트를 삭제합니다.
        result = await client.api.postData("playlist/deleteSong", {
          name: playlistName,
          songId: songId
        });

        if (result && result.status) {
          embed.setColor(Colors.Green)
          embed.setDescription(`✅ | 플레이리스트 **${playlistName}**를 삭제했습니다!`);
        } else {
          embed.setColor(Colors.Red)
          embed.setDescription(`🚫 | ${result.message || `플레이리스트 **${playlistName}**를 삭제하지 못했습니다!`}`);
        }
        await interaction.editReply({
          embeds: [embed],
          ephemeral: true
        });
        break;
      case "정보":
        // 플레이리스트에 추가된 노래 목록을 확인합니다.
        result = await client.api.getData(`playlist/get/${playlistName}`);

        if (result && result.status) {
          embed.setColor(Colors.Green)
          embed.setDescription(`✅ | 플레이리스트 **${playlistName}**의 노래 목록을 불러왔습니다!`);
          embed.addFields(
            {
              name: "노래 목록",
              value: result.data.songs.map((song, index) => {
                return `**${song.songId}.** [${song.title}](${song.url}) - \`${formatDuration(song.duration)}\``;
              }).join("\n")
            }
          )
        } else {
          embed.setColor(Colors.Red)
          embed.setDescription(`🚫 | ${result.message || `플레이리스트 **${playlistName}**의 노래 목록을 불러오지 못했습니다!`}`);
        }
        await interaction.editReply({
          embeds: [embed],
          ephemeral: true
        });
        break;
    }

  }
}).toJSON();

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; // hh:mm:ss
  } else {
    return `${minutes}:${String(secs).padStart(2, '0')}`; // mm:ss
  }
}