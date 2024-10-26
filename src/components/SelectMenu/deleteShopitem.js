const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const { EmbedBuilder, Colors } = require("discord.js");

module.exports = new Component({
    customId: 'deleteShopItem.select',
    type: 'select',
    /**
     * 
     * @param {DiscordBot} client 
     * @param {import("discord.js").AnySelectMenuInteraction} interaction 
     */
    run: async (client, interaction) => {
        const selectedItemValue = interaction.values[0]; // 선택된 트랙 value

        const result = await client.api.postData('shop/items/delete', {
            guildId: interaction.guild.id,
            itemId: selectedItemValue
        });

        await interaction.deferUpdate(); // 선택한 항목을 처리하는 동안 대기

        if (result || result.status) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setDescription(`
                        ✅ | 상품이 삭제되었습니다.
                        `)
                        .setFooter({
                            text: '상품 삭제',
                            iconUrl: interaction.user.avatarURL({ dynamic: true })
                        })
                        .setTimestamp()
                ],
                ephemeral: true
            });
        } else {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(`
                        ❌ | 상품 삭제에 실패했습니다.
                        `)
                        .setFooter({
                            text: '상품 삭제',
                            iconUrl: interaction.user.avatarURL({ dynamic: true })
                        })
                        .setTimestamp()
                ],
                ephemeral: true
            });
        }
    }
}).toJSON();
