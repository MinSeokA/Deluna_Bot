const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");


module.exports = new ApplicationCommand({
  command: {
    name: '자동재생',
    description: '자동재생 모드를 설정합니다.',
    options: [
      {
        type: 5, // BOOLEAN
        name: '상태',
        description: '자동재생 모드를 활성화하려면 true, 비활성화하려면 false를 입력하세요.',
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
    const status = interaction.options.getBoolean('상태');

    const queue = await client.music.getQueue(interaction);
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

    queue.toggleAutoplay(status);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(
            `🔄 | 자동재생 모드를 ${status ? '활성화' : '비활성화'}했습니다!`
          ),
      ],
    });
  }
}).toJSON();