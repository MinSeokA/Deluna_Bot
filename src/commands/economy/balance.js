const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: '잔고',
    description: '자신의 잔고를 확인합니다.',
    // 옵션추가 사용자 조회
    options: [
      {
        type: 6, // USER
        name: '유저',
        description: '유저를 조회합니다.',
        required: false
      }
    ]
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
    const user = interaction.options.getUser('유저') || interaction.user;
    const guildId = interaction.guildId;

    const economy = await client.api.getData(`economy/balance/${guildId}/${user.id}`);


    if (economy.status) {
      // balance와 bank 값을 포맷하여 반환
      const formattedBalance = new Intl.NumberFormat('ko-KR').format(economy.data.balance);
      const formattedBank = new Intl.NumberFormat('ko-KR').format(economy.data.bank);


      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${user.username}님의 잔고`)
            .setDescription(`💰 ${formattedBalance} 코인\n🏦 은행 잔고: ${formattedBank} 코인`)
            .setColor(Colors.Green)
            .setFooter({
              text: `요청자: ${interaction.user.username}`,
              iconURL: interaction.user.avatarURL()
            })
        ],
        ephemeral: true
      });
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('오류 발생')
            .setDescription(data.message || `API 요청에 실패 했습니다.`)
            .setColor(Colors.Red)
            .setFooter({
              text: `요청자: ${interaction.user.username}`,
              iconURL: interaction.user.avatarURL()
            })
        ],
        ephemeral: true
      });
    }
  }
}).toJSON();