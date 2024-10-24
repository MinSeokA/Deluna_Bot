const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: '필터',
    description: '오디오 필터를 적용합니다.',
    options: [
      {
        type: 3, // STRING
        name: '필터',
        description: '적용할 필터를 선택하세요.',
        required: true,
        choices: [
          { name: '삭제', value: 'clear' },
          { name: '볼륨', value: 'volume' },
          { name: '카라오케', value: 'karaoke' },
          { name: '타임스케일', value: 'timescale' },
          { name: '트레몰로', value: 'tremolo' },
          { name: '비브라토', value: 'vibrato' },
          { name: '8D사운드', value: '8d' },
          { name: '로우패스', value: 'lowPass' },
          { name: '나이트코어', value: 'nightcore' },
        ],
      },
    ],
  },
  options: {
    cooldown: 5000,
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

    const filterEnabled = player.filterManager.filters;

    const filter = interaction.options.getString("필터");

    const filters = filterEnabled.lowPass ? '로우패스' : filterEnabled.nightcore ? '나이트코어' : filterEnabled.karaoke ? '카라오케' : filterEnabled.tremolo ? '트레몰로' : filterEnabled.vibrato ? '비브라토' : filterEnabled.rotation ? '8D사운드' : '볼륨';
    if (filter === filters) {
      player.filterManager.toggleKaraoke() ? '카라오케' : player.filterManager.toggleTremolo() ? '트레몰로' : player.filterManager.toggleVibrato() ? '비브라토' : player.filterManager.toggleRotation() ? '8D사운드' : player.filterManager.toggleLowPass() ? '로우패스' : player.filterManager.toggleNightcore() ? '나이트코어' : player.filterManager.setVolume(100);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`🚫 | 이미 ${filter} 필터가 활성화되어 있습니다.`),
        ],
        ephemeral: true,
      });
    }

    switch (filter) {
      case 'volume':
        player.filterManager.setVolume(100); // 100%로 설정
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Green)
              .setDescription(`🔊 | 볼륨을 100%로 설정했습니다.`),
          ],
          ephemeral: true,
        });
      case 'clear':
        player.filterManager.resetFilters();
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Green)
              .setDescription(`🔊 | 모든 필터를 제거했습니다.`),
          ],
          ephemeral: true,
        });
      case 'nightcore':
        await player.filterManager.toggleNightcore();
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Green)
              .setDescription(`🔊 | 하이패스 필터를 전환했습니다.`),
          ],
          ephemeral: true,
        });
      case 'karaoke':
        await player.filterManager.toggleKaraoke();
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Green)
              .setDescription(`🎤 | 카라오케 필터를 전환했습니다.`),
          ],
          ephemeral: true,
        });
      case 'tremolo':
        await player.filterManager.toggleTremolo();
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Green)
              .setDescription(`🌊 | 트레몰로 필터를 전환했습니다.`),
          ],
          ephemeral: true,
        });
      case 'vibrato':
        await player.filterManager.toggleVibrato();
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Green)
              .setDescription(`🎶 | 비브라토 필터를 전환했습니다.`),
          ],
          ephemeral: true,
        });
      case '8d':
        await player.filterManager.toggleRotation();
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Green)
              .setDescription(`🔄 | 8d 필터를 전환했습니다.`),
          ],
          ephemeral: true,
        });
      case 'lowPass':
        await player.filterManager.toggleLowPass();
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Green)
              .setDescription(`🔇 | 로우패스 필터를 전환했습니다.`),
          ],
          ephemeral: true,
        });
    }
  },
}).toJSON();
