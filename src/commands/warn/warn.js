const { ChatInputCommandInteraction, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: '경고',
    description: '경고 정보를 확인하거나 경고를 추가합니다.',
    type: 1,
    options: [
      {
        type: 1, // Subcommand
        name: '확인',
        description: '사용자의 경고 정보를 확인합니다.',
        options: [
          {
            type: 6, // USER
            name: '사용자',
            description: '경고 정보를 확인할 사용자를 선택하세요.',
            required: true
          }
        ]
      },
      {
        type: 1, // Subcommand
        name: '추가',
        description: '사용자에게 경고를 추가합니다.',
        options: [
          {
            type: 6, // USER
            name: '사용자',
            description: '경고를 부여할 사용자를 선택하세요.',
            required: true
          },
          {
            type: 3, // STRING
            name: '사유',
            description: '경고를 부여하는 이유를 입력하세요.',
            required: false
          }
        ]
      },
      {
        type: 1, // Subcommand
        name: '제거',
        description: '사용자의 경고를 제거합니다.',
        options: [
          {
            type: 6, // USER
            name: '사용자',
            description: '경고를 제거할 사용자를 선택하세요.',
            required: true
          },
          {
            type: 3, // STRING
            name: 'id',
            description: '제거할 경고 ID를 입력하세요.',
            required: true
          },
        ],
      },
    ],
    default_member_permissions: `${PermissionFlagsBits.Administrator}` | `${PermissionFlagsBits.KickMembers}` | `${PermissionFlagsBits.BanMembers}`
  },
  /**
   * 
   * @param {DiscordBot} client 
   * @param {ChatInputCommandInteraction} interaction 
   */
  run: async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '확인') {
      const user = interaction.options.getUser('사용자');
      const guildId = interaction.guild.id;

      // API에서 특정 유저의 경고 목록을 가져옴
      const response = await client.api.getData(`warn/user/${guildId}/${user.id}`);
      
      // response의 data가 undefined일 경우 빈 배열로 설정
      const userWarnings = response?.data ?? [];

      if (!userWarnings || userWarnings.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle('사용자 경고 정보')
          .setDescription('사용자의 경고 정보가 없습니다.')
          .setColor(Colors.Green)
          .setTimestamp();

        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('사용자 경고 정보')
        .setDescription(`사용자의 경고 정보입니다.`)
        .setColor(Colors.Green)
        .setTimestamp();

      for (const warning of userWarnings) {
        const moderator = await client.users.fetch(warning.moderatorId);
        embed.addFields({
          name: `경고 ID: ${warning.warnId}`,
          value: `경고 부여자: ${moderator.tag}\n사유: ${warning.reason}\n경고 부여 일시: ${new Date(warning.createdAt).toLocaleString()}`
        });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } else if (subcommand === '추가') {
      const user = interaction.options.getUser('사용자'); // 경고를 부여할 사용자
      const moderatorId = interaction.user.id; // 경고 부여하는 사용자 ID
      const guildId = interaction.guild.id; // 서버 ID
      const reason = interaction.options.getString('사유'); // 경고 부여 사유

      try {
        // 봇이 경고를 부여할 사용자의 권한을 확인
        const botMember = await interaction.guild.members.fetch(client.user.id);
        const userMember = await interaction.guild.members.fetch(user.id);

        // 봇이 경고를 부여할 사용자보다 높은 권한을 가지고 있는지 확인
        if (botMember.roles.highest.comparePositionTo(userMember.roles.highest) <= 0) {
          const embed = new EmbedBuilder()
            .setTitle('사용자 경고 부여 실패')
            .setDescription('봇이 경고를 부여할 사용자보다 높은 권한을 가지고 있습니다.')
            .setColor(Colors.Red)
            .setTimestamp();

          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (botMember.id === user.id) {
          const embed = new EmbedBuilder()
            .setTitle('사용자 경고 부여 실패')
            .setDescription('봇은 자신에게 경고를 부여할 수 없습니다.')
            .setColor(Colors.Red)
            .setTimestamp();

          return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // API 서버에 경고 부여 요청
        const result = await client.api.postData('warn/add', {
          guildId,
          userId: user.id,
          moderatorId,
          reason: reason ? reason : '사유 없음'
        });

        // Embed
        let embed = new EmbedBuilder()
          .setTitle('경고 부여')
          .setColor(Colors.Green)
          .setTimestamp();

        // API 응답 검증
        if (result && result.status) { // 예: result.success가 성공 여부를 나타낸다면
          embed.setDescription('사용자에게 경고를 부여했습니다.');
          embed.addFields({
            name: `경고 ID: ${result.data.warnId}`,
            value: `경고 부여자: ${interaction.user.username}\n사유: ${result.data.reason}\n경고 부여 일시: ${new Date(result.data.createdAt).toLocaleString()}`
          });
        } else {
          embed.setColor(Colors.Red);
          embed.setDescription(result.message || '사용자에게 경고를 부여하는 동안 오류가 발생했습니다.')
        }

        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });

      } catch (error) {
        console.error('API 요청 실패:', error);
      }
    } else if (subcommand === '제거') {
      const user = interaction.options.getUser('사용자'); // 경고를 제거할 사용자
      const warningId = interaction.options.getString('id'); // 제거할 경고 ID

      // API 서버에 경고 제거 요청
      const result = await client.api.postData(`warn/delete/${user.id}/${warningId}`);

      // Embed
      let embed = new EmbedBuilder()
        .setTitle('경고 제거')
        .setColor(Colors.Green)
        .setTimestamp();

      // API 응답 검증
      if (result && result.status) { // 예: result.success가 성공 여부를 나타낸다면
        embed.setDescription('사용자의 경고를 제거했습니다.');
      } else {
        embed.setColor(Colors.Red);
        embed.setDescription(result.message || '사용자의 경고를 제거하는 동안 오류가 발생했습니다.')
      }

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  }
}).toJSON();
