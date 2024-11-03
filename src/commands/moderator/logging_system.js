const { ChatInputCommandInteraction, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: '길드로그',
    description: '길드의 로그 설정을 업데이트합니다.',
    type: 1,
    default_member_permissions: `${PermissionFlagsBits.Administrator}` | `${PermissionFlagsBits.ManageGuild}`,
    options: [
      {
        name: '이코노미',
        type: 3,
        description: '경제 로그를 활성화 또는 비활성화합니다. (활성화/비활성화)',
        required: false,
        choices: [
          { name: '활성화', value: '활성화' },
          { name: '비활성화', value: '비활성화' }
        ]
      },
      {
        name: '관리',
        type: 3,
        description: '관리 로그를 활성화 또는 비활성화합니다. (활성화/비활성화)',
        required: false,
        choices: [
          { name: '활성화', value: '활성화' },
          { name: '비활성화', value: '비활성화' }
        ]
      },
      {
        name: '채널',
        type: 7,
        description: '해당 로그를 전송할 채널을 선택합니다.',
        required: false,
      },
    ],
  },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
  run: async (client, interaction) => {
    const guildId = interaction.guild.id; // 길드 ID를 문자열로 변환합니다.

    const channel = interaction.options.getChannel('채널')?.id; // 채널 ID를 문자열로 변환
    const economyLoggingEnabled = interaction.options.getString('이코노미');
    const moderationLoggingEnabled = interaction.options.getString('관리');

    if (economyLoggingEnabled) {
      const updates = {
        settings: {
          economyLogs: {
            isEnabled: economyLoggingEnabled === '활성화',
            channelId: channel
          }
        }
      }

      const result = await client.api.putData(`logging/${guildId}`, updates);

      if (result.status) {
        // 임배드
        const embed = new EmbedBuilder()
          .setColor(Colors.Green)
          .setTimestamp()
          .setDescription(`
        > **이코노미 로그 설정 업데이트**
        
        > **상태**: ${economyLoggingEnabled === '활성화' ? '활성화' : '비활성화'}
        > **채널**: ${channel ? `<#${channel}>` : '없음'}
        `);

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        // 임배드
        const embed = new EmbedBuilder()
          .setColor(Colors.Red)
          .setTimestamp()
          .setDescription(`로그 설정 업데이트 실패: ${result.message}`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }

    } else if (moderationLoggingEnabled) {
      const updates = {
        settings: {
          moderationLogs: {
            isEnabled: moderationLoggingEnabled === '활성화',
            channelId: channel
          }
        }
      }

      const result = await client.api.putData(`logging/${guildId}`, updates);

      if (result.status) {
        // 임배드
        const embed = new EmbedBuilder()
          .setColor(Colors.Green)
          .setTimestamp()
          .setDescription(`
        > **관리 로그 설정 업데이트**
        
        > **상태**: ${moderationLoggingEnabled === '활성화' ? '활성화' : '비활성화'}
        > **채널**: ${channel ? `<#${channel}>` : '없음'}
        `);

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        // 임배드
        const embed = new EmbedBuilder()
          .setColor(Colors.Red)
          .setTimestamp()
          .setDescription(`로그 설정 업데이트 실패: ${result.message}`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  }
}).toJSON();
