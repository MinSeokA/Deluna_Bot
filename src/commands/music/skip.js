const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: '스킵',
    description: '음악을 스킵합니다.',
    options: [
      {
        type: 4, // Integer type
        name: '몇번째곡',
        description: '몇 번째 곡으로 건너뛰시겠습니까?',
        required: false,
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

    const vcId = interaction.member?.voice?.channelId;
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

    const skipTo = interaction.options.getInteger('몇번째곡') || 0;
    const currentTrack = player.queue.current;
    const nextTrack = player.queue.tracks[skipTo];

    if (!nextTrack) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`🚫 | 스킵할 트랙이 없습니다.`),
        ],
        ephemeral: true,
      });
    }

    await player.skip(skipTo);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`⏭ | [\`${currentTrack?.info.title}\`](<${currentTrack?.info.uri}>)에서 [\`${nextTrack?.info.title}\`](<${nextTrack?.info.uri}>)로 스킵했습니다.`),
      ],
      ephemeral: true,
    });
  }
}).toJSON();
