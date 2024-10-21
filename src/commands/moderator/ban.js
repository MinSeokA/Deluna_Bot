const { ChatInputCommandInteraction, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: '차단',
        description: '사용자를 차단합니다.',
        type: 1,
        options: [
            {
                type: 6, // USER
                name: '사용자',
                description: '차단할 사용자를 선택하세요.',
                required: true
            },
            {
                type: 3, // STRING
                name: '사유',
                description: '사용자를 차단하는 이유를 입력하세요.',
                required: false // 사유는 필수로 입력받도록 설정
            }
        ],
        default_member_permissions: `${PermissionFlagsBits.BanMembers}` | `${PermissionFlagsBits.Administrator}`
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const user = interaction.options.getUser('사용자'); // 차단할 사용자
        const moderatorId = interaction.user.id; // 차단하는 사용자 ID
        const guildId = interaction.guild.id; // 서버 ID
        const reason = interaction.options.getString('사유'); // 차단 사유

        try {
            // 봇이 차단할 사용자의 권한을 확인
            const botMember = await interaction.guild.members.fetch(client.user.id);
            const userMember = await interaction.guild.members.fetch(user.id);

            // 봇이 차단할 사용자보다 높은 권한을 가지고 있는지 확인
            if (botMember.roles.highest.comparePositionTo(userMember.roles.highest) <= 0) {
                const embed = new EmbedBuilder()
                    .setTitle('사용자 차단 실패')
                    .setDescription('봇이 차단할 사용자보다 높은 권한을 가지고 있습니다.')
                    .setColor(Colors.Red)
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }
            
            if (botMember.id === user.id) {
                const embed = new EmbedBuilder()
                    .setTitle('사용자 차단 실패')
                    .setDescription('봇은 자신을 차단할 수 없습니다.')
                    .setColor(Colors.Red)
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // API를 통해 차단 기록 저장 요청
            const result = await client.api.postData('ban/user', {
                blockerId: moderatorId,
                blockedId: user.id,
                guildId: guildId,
                reason: reason // 차단 사유 추가
            });

            // 응답 메시지
            if (result && result.status) { // 예: result.success가 성공 여부를 나타낸다면
                const embed = new EmbedBuilder()
                    .setTitle('사용자 차단')
                    .setDescription(`${user.tag} (${user.id}) 사용자를 차단했습니다.`)
                    .addField('사유', reason) // 차단 사유 표시
                    .setColor(Colors.Green)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });

                await interaction.guild.members.ban(user.id, { reason: reason }); // 차단 사유를 사용하여 사용자 차단
            } else {
                const embed = new EmbedBuilder()
                    .setTitle('사용자 차단 실패')
                    .setDescription(result.message || '사용자를 차단하는 동안 오류가 발생했습니다.')
                    .setColor(Colors.Red)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (error) {
            console.error('API 요청 실패:', error);
            const embed = new EmbedBuilder()
                .setTitle('오류 발생')
                .setDescription('사용자를 차단하는 동안 오류가 발생했습니다.')
                .setColor(Colors.Red)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
}).toJSON();
