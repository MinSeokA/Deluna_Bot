const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: '일시정지',
    description: '음악을 일시정지합니다.',
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

    if (player.paused) {
      await player.resume();
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`▶ | 음악을 다시 재생합니다.`),
        ],
        ephemeral: true,
      });
    }

    player.pause();
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription(`⏸ | 음악을 일시정지합니다.`),
      ],
      ephemeral: true,
    });
  }
}).toJSON();