// 데이터베이스 길드 생성

const { ChatInputCommandInteraction, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: '길드생성',
        description: 'API 서버에 길드를 생성합니다.',
        type: 1,
        default_member_permissions: `${PermissionFlagsBits.Administrator}`
    },
    options: {
        cooldown: 1000,
        guildOwner: true
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
      const result = await client.api.postData('guilds/create', {
        guildId: interaction.guild.id,
        prefix: '?', // 기본 프리픽스 설정
        ownerId: interaction.guild.ownerId,
      });

      try {
        // Embed
        let embed = new EmbedBuilder()
          .setTitle('길드 생성')
          .setColor(Colors.Green)
          .setTimestamp();
    
        // API 응답 검증
        if (result && result.status) { // 예: result.success가 성공 여부를 나타낸다면
          embed.setDescription('길드가 성공적으로 생성되었습니다.');
        } else {
          embed.setColor(Colors.Red);
          embed.setDescription(result.message || '길드 생성에 실패 했습니다.')
        }
    
        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
    
      } catch (error) {
        console.error('API 요청 실패:', error);
        
        const errorEmbed = new EmbedBuilder()
          .setTitle('오류 발생')
          .setDescription(result.message || 'API 서버와 통신 중 오류가 발생했습니다.')
          .setFooter('API 서버와 통신 중 오류가 발생했습니다.')
          .setColor(Colors.Red)
          .setTimestamp();
    
        await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }
    }    
}).toJSON();
