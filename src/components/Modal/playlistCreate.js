const { ModalSubmitInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
  customId: 'playlistCreate',
  type: 'modal',
  /**
   * 
   * @param {DiscordBot} client 
   * @param {ModalSubmitInteraction} interaction 
   */
  run: async (client, interaction) => {
    // 모달에서 입력된 값 가져오기
    const playlistName = interaction.fields.getTextInputValue('playlist-name-Create');

    let result;

    result = await client.api.postData("playlist/create", {
      name: playlistName,
      userId: interaction.user.id
    });

    if (result && result.status) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`✅ | 플레이리스트가 생성되었습니다.`),
        ],
        ephemeral: true,
      });
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`❌ | ${result.message || `플레이리스트를 생성하지 못했습니다!`}`),
        ],
        ephemeral: true,
      })
    }
  }
}).toJSON();
