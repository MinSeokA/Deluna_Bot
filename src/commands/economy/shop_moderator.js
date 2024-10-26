const { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, Colors, Embed } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: '상점관리',
    description: '상점을 관리합니다.',
    default_member_permissions: `${PermissionFlagsBits.Administrator}` || `${PermissionFlagsBits.ManageGuild}`,
    // 옵션추가 상점 관리 추가, 수정, 삭제
    options: [
      {
        type: 1, // SUB_COMMAND
        name: '추가',
        description: '상품을 추가합니다.',
      },
      {
        type: 1, // SUB_COMMAND
        name: '수정',
        description: '상품을 수정합니다.',
      },
      {
        type: 1, // SUB_COMMAND
        name: '삭제',
        description: '상품을 삭제합니다.',
      }
    ],
  },
  /**
   * 
   * @param {DiscordBot} client 
   * @param {ChatInputCommandInteraction} interaction 
   */
  run: async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand();


    switch (subCommand) {
      case '추가':
        // 상품 추가
        await interaction.showModal({
          custom_id: 'addShopItem',
          title: '상품 추가',
          components: [
            {
              type: 1,  // 첫 번째 행
              components: [
                {
                  type: 4,
                  custom_id: 'item-name',
                  label: '상품명',
                  max_length: 50,  // 최대 길이 조정
                  min_length: 1,    // 최소 길이 조정
                  placeholder: '상품명을 입력하세요!',
                  style: 1,         // 단일 줄 텍스트 필드
                  required: true,
                },
              ],
            },
            {
              type: 1,  // 두 번째 행
              components: [
                {
                  type: 4,
                  custom_id: 'item-price',
                  label: '가격',
                  max_length: 10,   // 최대 길이 조정
                  min_length: 1,    // 최소 길이 조정
                  placeholder: '가격을 입력하세요!',
                  style: 1,         // 단일 줄 텍스트 필드
                  required: true,
                },
              ],
            },
            {
              type: 1,  // 세 번째 행
              components: [
                {
                  type: 4,
                  custom_id: 'item-stock',
                  label: '수량',
                  max_length: 10,    // 최대 길이 조정
                  min_length: 1,    // 최소 길이 조정
                  placeholder: '수량을 입력하세요!',
                  style: 1,         // 단일 줄 텍스트 필드
                  required: true,
                },
              ],
            },
          ],
        });


        break;
      case '수정':
        // 상품 수정
        break;
      case '삭제':
        // 상품 삭제
        const itemsDeleteEmbed = new EmbedBuilder()
          .setColor(Colors.Blue)
          .setDescription(`
          > 🛒 | 상품을 삭제합니다.

          > INFO | 상품을 선택하세요.
          > INFO | 삭제된 상품은 복구할 수 없습니다.
          > INFO | 삭제된 상품은 사용자에게 보이지 않습니다.

          > 📌 | 상품을 삭제하려면 아래에서 상품을 선택하세요.

          `)
          .setFooter({
            text: `요청자: ${interaction.user.username}`,
          })
          .setTimestamp();

        const result = await client.api.getData(`shop/items/${interaction.guildId}`);

        if (result || result.status) {
          // 선택 메뉴와 버튼 추가
          await interaction.reply({
            embeds: [
              itemsDeleteEmbed
            ],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 3, // String Select Menu
                    custom_id: 'deleteShopItem.select',
                    placeholder: '상품을 선택하세요...',
                    options: result.data[0].shop.items.slice(0, 20).map((item, index) => ({
                      label: `${item.name} - ${item.price.toLocaleString()}원 | 재고: ${item.stock.toLocaleString()}개`,
                      value: item.itemId
                    }))
                  }
                ]
              }
            ],
            ephemeral: true,
          });

        }
        break;
    }
  }
}).toJSON();