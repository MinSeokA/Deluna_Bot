const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: '필터',
    description: '음악 필터를 설정합니다.',
    type: 1,
    options: [
      {
        type: 1, // Subcommand
        name: '활성화',
        description: '음악 필터를 활성화합니다.',
        options: [
          {
            type: 3, // String
            name: '필터',
            description: '활성화할 필터를 선택하세요.',
            required: true,
            choices: [
              { name: '끄기', value: 'off' },
              { name: '3D', value: '3d' },
              { name: '베이스 부스트', value: 'bassboost' },
              { name: '에코', value: 'echo' },
              { name: '카라오케', value: 'karaoke' },
              { name: '나이트코어', value: 'nightcore' },
              { name: '베이퍼웨이브', value: 'vaporwave' },
              { name: '플랜저', value: 'flanger' },
              { name: '게이트', value: 'gate' },
              { name: '하스', value: 'haas' },
              { name: '리버스', value: 'reverse' },
              { name: '서라운드', value: 'surround' },
              { name: 'M컴팬드', value: 'mcompand' },
              { name: '페이저', value: 'phaser' },
              { name: '트레몰로', value: 'tremolo' },
              { name: '이어왁스', value: 'earwax' }
            ]
          }
        ]
      }
    ],
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
    const filter = interaction.options.getString('필터');

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



    if (filter === "off" && queue.filters.size) queue.filters.clear();
    else if (Object.keys(client.music.filters).includes(filter)) {
        if (queue.filters.has(filter)) queue.filters.remove(filter);
        else queue.filters.add(filter);
    }

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(
            `🎵 | 음악 필터를 설정했습니다. | 필터: ${filter}`
          ),
      ],
    });
  }
}).toJSON();
