const { ModalSubmitInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
  customId: 'setCheckinReward',
  type: 'modal',
  /**
   * 
   * @param {DiscordBot} client 
   * @param {ModalSubmitInteraction} interaction 
   */
  run: async (client, interaction) => {
    // 모달에서 입력된 값 가져오기
    const Reward = interaction.fields.getTextInputValue('checkIn-reward');

    // 사용자에게 응답
    // 출석체크 보상 설정
    const result = await client.api.postData('economy/setCheckInReward', {
      guildId: interaction.guild.id,
      amount: Reward
    });

    if (result.status) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('출석체크 보상 설정')
            .setDescription(`
                        ✅ | 출석체크 보상이 설정되었습니다.

                        > 보상: ${Reward.toLowerCase()}
                        `)
            .setFooter({
              text: '출석체크 보상 설정',
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
            .setTitle('출석체크 보상 설정')
            .setDescription(`
                        ❌ | 출석체크 보상 설정에 실패했습니다.
                        `)
            .setFooter({
              text: '출석체크 보상 설정',
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
