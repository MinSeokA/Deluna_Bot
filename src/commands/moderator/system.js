const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: '길드',
    description: '경고, 차단, 추방 기능을 관리합니다.',
    type: 1,
    options: [
      {
        type: 1, // Subcommand
        name: '설정', // 활성화/비활성화
        description: '기능을 활성화 또는 비활성화합니다.',
        options: [
          {
            type: 3, // String
            name: '기능',
            description: '활성화/비활성화할 기능을 선택하세요.',
            required: true,
            choices: [
              { name: '경고', value: 'warn' },
              { name: '차단', value: 'ban' },
              { name: '추방', value: 'kick' },
              { name: '이코노미', value: 'economy' },
            ]
          },
          {
            type: 5, // Boolean
            name: '상태',
            description: '기능을 활성화하려면 true, 비활성화하려면 false를 입력하세요.',
            required: true
          }
        ]
      }
    ]
  },
  options: {
    cooldown: 10000
  },
  /**
   * 
   * @param {DiscordBot} client 
   * @param {ChatInputCommandInteraction} interaction 
   */
  run: async (client, interaction) => {
    const feature = interaction.options.getString('기능');
    const status = interaction.options.getBoolean('상태');

    const result = await client.api.postData(`guilds/update`, {
      guildId: interaction.guild.id,
      updateData: { // 업데이트할 데이터를 포함합니다.
        system: {
          feature: feature,
          status: status
        } 
      }
    });

    // API 응답 검증
    if (!result || !result.status) {
      const embed = new EmbedBuilder()
        .setTitle('길드 설정 실패')
        .setDescription(result.message || '기능을 설정하는 동안 오류가 발생했습니다.')
        .setColor(Colors.Red)
        .setTimestamp();

      return await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }
    // 영어 단어와 한국어 단어 매핑
    const featureMap = {
      'warn': '경고',
      'ban': '차단',
      'kick': '추방',
      'economy': '이코노미'
    };

    // feature를 featureMap을 사용하여 한국어로 변환
    const Feature = featureMap[feature];

    const embed = new EmbedBuilder()
      .setTitle('길드 설정')
      .setDescription(`${Feature} 기능이 ${status ? '활성화' : '비활성화'}되었습니다.`)
      .setColor(status ? Colors.Green : Colors.Red)
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  }
}).toJSON();
