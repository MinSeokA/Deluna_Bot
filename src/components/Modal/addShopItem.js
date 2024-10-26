const { ModalSubmitInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
  customId: 'addShopItem',
  type: 'modal',
  /**
   * 
   * @param {DiscordBot} client 
   * @param {ModalSubmitInteraction} interaction 
   */
  run: async (client, interaction) => {
    // 모달에서 입력된 값 가져오기
    const itemName = interaction.fields.getTextInputValue('item-name');
    const itemPrice = interaction.fields.getTextInputValue('item-price').toLocaleString();
    const itemStock = interaction.fields.getTextInputValue('item-stock').toLocaleString();

    // 사용자에게 응답
    // 상품 추가
    const result = await client.api.postData('shop/items/add', {
      guildId: interaction.guild.id,
      item: {
        itemId: generateRandomId(8),
        name: itemName,
        stock: itemStock,
        price: itemPrice,
      }
    });

    if (result.status) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('상품 추가')
            .setDescription(`
                        ✅ | 상품이 추가되었습니다.

                        > 상품명: ${itemName}
                        > 가격: ${itemPrice.toLocaleString()}
                        > 재고: ${itemStock.toLocaleString()}
                        `)
            .setFooter({
              text: '상품 추가',
              iconUrl: interaction.user.avatarURL({ dynamic: true })
            })
            .setTimestamp()
        ],
        ephemeral: true
      })
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('상품 추가')
            .setDescription(`
                        ❌ | 상품 추가에 실패했습니다.
                        `)
            .setFooter({
              text: '상품 추가',
              iconUrl: interaction.user.avatarURL({ dynamic: true })
            })
            .setTimestamp()
        ],
        ephemeral: true
      })
    }
  }
}).toJSON();

function generateRandomId(length) {
  return Math.random().toString(36).substring(2, 2 + length); // 2번째 인덱스부터 길이만큼 잘라냅니다.
}
