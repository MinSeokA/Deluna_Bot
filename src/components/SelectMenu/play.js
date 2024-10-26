const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const { EmbedBuilder, Colors } = require("discord.js");
const { info } = require("../../utils/Console");

module.exports = new Component({
  customId: 'play.select',
  type: 'select',
  /**
   * 
   * @param {DiscordBot} client 
   * @param {import("discord.js").AnySelectMenuInteraction} interaction 
   */
  run: async (client, interaction) => {
    const platform = interaction.values[0];

    await interaction.showModal({
      custom_id: "playSong",
      title: "음악을 재생할 링크 또는 검색어를 입력해주세요.",
      components: [
        {
          type: 1,
          components: [
            {
              type: 4, // Text Input
              custom_id: "play-platform",
              label: "플랫폼 (자동으로 채워 집니다. 수정하지 말아주세요.)",
              placeholder: "플랫폼",
              value: platform,
              style: 1, // Short style for single line
              required: true,
              disabled: true // Disable the field since it's auto-filled
            }
          ]
        },
        {
          type: 1,
          components: [
            {
              type: 4, // Text Input
              custom_id: "play-url",
              label: "링크 또는 검색어",
              placeholder: "링크 또는 검색어를 입력하세요!",
              style: 1, // Short style for single line
              required: true
            }
          ]
        }
      ]
    });
  }
}).toJSON();
