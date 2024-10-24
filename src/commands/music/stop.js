const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const { info } = require("../../utils/Console");

module.exports = new ApplicationCommand({
  command: {
    name: '정지',
    description: '음악을 정지합니다.',
    options: [
      {
        type: 3, // STRING
        name: '선택',
        description: '음악을 정지합니다.',
        required: true,
        choices: [
          { name: '음악 정지', value: 'musicStopPlaying' },
          { name: '음악 정지 및 나가기', value: 'musicStop' },
        ],
      },
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
    const player = client.music.getPlayer(interaction.guildId);

    if (!player) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`🚫 | 재생중인 음악이 없습니다.`),
        ],
        ephemeral: true,
      });
    }

    const choice = interaction.options.getString("선택");

    if (choice === 'musicStopPlaying') {
      player.stopPlaying();
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`⏹ | 음악을 정지합니다.`),
        ],
        ephemeral: true,
      });
    }

    if (choice === 'musicStop') {
      player.destroy();
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`⏹ | 음악을 정지하고 음성 채널에서 나갑니다.`),
        ],
        ephemeral: true,
      });
    }
  }
}).toJSON();