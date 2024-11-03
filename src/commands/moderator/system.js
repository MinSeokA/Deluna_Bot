const { ChatInputCommandInteraction, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: '길드',
    description: '경고, 차단, 추방 및 로그 기능을 관리합니다.',
    default_member_permissions: `${PermissionFlagsBits.Administrator}` | `${PermissionFlagsBits.ManageGuild}`,
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
              { name: '로그', value: 'log' }, // 로그 기능 추가
            ]
          },
          {
            type: 3, // String
            name: '상태',
            description: '기능을 활성화하려면 "활성화", 비활성화하려면 "비활성화"를 입력하세요.',
            required: true,
            choices: [
              { name: '활성화', value: 'enable' },
              { name: '비활성화', value: 'disable' },
            ]
          },
          {
            type: 7, // Channel
            name: '채널', // 로그를 기록할 채널 선택
            description: '로그를 기록할 채널을 선택하세요.',
            required: false,
          }
        ]
      }
    ]
  },
  options: {
    cooldown: 1000
  },
  /**
   * 
   * @param {DiscordBot} client 
   * @param {ChatInputCommandInteraction} interaction 
   */
  run: async (client, interaction) => {
    const feature = interaction.options.getString('기능');
    const status = interaction.options.getString('상태');
    const channelId = interaction.options.getChannel('채널')?.id; // 채널 ID를 가져오는 부분

    // 로그 기능 활성화 또는 비활성화
    if (feature === 'log') {
      // 로그 데이터베이스가 없을 경우 생성
      const loggingCheck = await client.api.getData(`logging/${interaction.guild.id}`);
      if (!loggingCheck.data) {
        await client.api.postData(`logging/${interaction.guild.id}`);
      }

      if (status === 'enable') {
        const result = await client.api.putData(`logging/${interaction.guild.id}/enable`, { channelId });
        if (!result || !result.status) {
          const embed = new EmbedBuilder()
            .setTitle('로그 활성화 실패')
            .setDescription(result.message || '로그 기능을 활성화하는 동안 오류가 발생했습니다.')
            .setColor(Colors.Red)
            .setTimestamp();
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      } else if (status === 'disable') {
        const result = await client.api.putData(`logging/${interaction.guild.id}/disable`);
        if (!result || !result.status) {
          const embed = new EmbedBuilder()
            .setTitle('로그 비활성화 실패')
            .setDescription(result.message || '로그 기능을 비활성화하는 동안 오류가 발생했습니다.')
            .setColor(Colors.Red)
            .setTimestamp();
          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
    } else {


      const result = await client.api.postData(`guilds/${interaction.guild.id}/update`, {
        updateData: { // 업데이트할 데이터를 포함합니다.
          system: {
            feature: feature,
            status: status === 'enable' ? true : false
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
  }
}).toJSON();
