const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: '반복',
    description: '현재 트랙의 반복 모드를 설정합니다.',
    options: [
      {
        type: 3, // String type for repeat mode
        name: '반복모드',
        description: '반복 모드를 설정합니다.',
        required: true,
        choices: [
          { name: '끄기', value: 'off' },
          { name: '현재 재생중인 곡 반복', value: 'track' },
          { name: '재생목록 반복', value: 'queue' },
        ],
      },
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
    if (!interaction.guildId) return;

    const vcId = interaction.member?.voice?.channelId;
    const player = client.music.getPlayer(interaction.guildId);
    
    if (!player) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`🚫 | 재생 중인 음악이 없습니다.`),
        ],
        ephemeral: true,
      });
    }

    if (!vcId) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`🚫 | 음성 채널에 먼저 접속해주세요.`),
        ],
        ephemeral: true,
      });
    }

    if (player.voiceChannelId !== vcId) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`🚫 | 델루나와 같은 음성 채널에 있어야 합니다.`),
        ],
        ephemeral: true,
      });
    }

    const repeatMode = interaction.options.getString('반복모드');
    await player.setRepeatMode(repeatMode);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`🔁 | 반복 모드를 **${repeatMode === 'off' ? '끄기' : repeatMode === 'track' ? '현재 재생중인 곡 반복' : '재생목록 반복'}**로 설정했습니다.`),
      ],
      ephemeral: true,
    });
  }
}).toJSON();
