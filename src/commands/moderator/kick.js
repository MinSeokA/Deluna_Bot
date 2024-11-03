const { ChatInputCommandInteraction, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

// 로그 채널 캐시
const Cache = require("../../utils/Cache"); // 캐시 모듈 임포트

const logChannelCache = new Cache(300000); // 5분 TTL로 캐시 생성

module.exports = new ApplicationCommand({
    command: {
        name: '추방',
        description: '사용자를 추방합니다.',
        default_member_permissions: `${PermissionFlagsBits.KickMembers}` | `${PermissionFlagsBits.Administrator}`,
        type: 1,
        options: [
            {
                type: 6, // USER
                name: '사용자',
                description: '추방할 사용자를 선택하세요.',
                required: true
            },
            {
                type: 3, // STRING
                name: '사유',
                description: '사용자를 추방하는 이유를 입력하세요.',
                required: false // 사유는 선택 사항
            }
        ],
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const user = interaction.options.getUser('사용자'); // 추방할 사용자
        const moderatorId = interaction.user.id; // 추방하는 사용자 ID
        const guildId = interaction.guild.id; // 서버 ID
        const reason = interaction.options.getString('사유') || '사유 없음'; // 기본 사유 설정

        try {
            const botMember = await interaction.guild.members.fetch(client.user.id);
            const userMember = await interaction.guild.members.fetch(user.id);

            if (!userMember) {
                return await interaction.reply({ embeds: [createEmbed('사용자 추방 실패', '사용자를 찾을 수 없습니다.', Colors.Red)], ephemeral: true });
            } 
            
            if (botMember.roles.highest.comparePositionTo(userMember.roles.highest) <= 0) {
                return await interaction.reply({ embeds: [createEmbed('사용자 추방 실패', '봇이 추방할 사용자보다 높은 권한을 가지고 있습니다.', Colors.Red)], ephemeral: true });
            }

            if (botMember.id === user.id) {
                return await interaction.reply({ embeds: [createEmbed('사용자 추방 실패', '봇은 자신을 추방할 수 없습니다.', Colors.Red)], ephemeral: true });
            }

            // 사용자를 추방
            await interaction.guild.members.kick(user.id, { reason });

            const result = await client.api.postData('kick/user', { moderatorId, userId: user.id, guildId, reason });

            if (result && result.status) {
                await client.logging.addModerationLog(guildId, '추방', { moderatorId, userId: user.id, reason });

                // 캐시된 로그 채널 가져오기
                let logChannel = logChannelCache.get(guildId);
                if (!logChannel) {
                    const loggingSettings = await client.logging.getLogging(guildId);
                    if (loggingSettings && loggingSettings.data.settings.moderationLogs?.isEnabled && loggingSettings.data.settings.moderationLogs.channelId) {
                        logChannel = await interaction.guild.channels.fetch(loggingSettings.data.settings.moderationLogs.channelId);
                        if (logChannel) logChannelCache.set(guildId, logChannel); // 캐시에 추가
                    }
                }

                if (logChannel) {
                    const logEmbed = createEmbed('사용자 추방 로그', `${user.tag} (${user.id}) 사용자가 추방되었습니다.`, Colors.Blue)
                        .addFields({ name: '사유', value: reason });
                    await logChannel.send({ embeds: [logEmbed] });
                }

                return await interaction.reply({ embeds: [createEmbed('사용자 추방', `${user.tag} (${user.id}) 사용자를 추방했습니다.`, Colors.Green).addFields({ name: '사유', value: reason })] });
            } else {
                return await interaction.reply({ embeds: [createEmbed('사용자 추방 실패', result.message || '사용자를 추방하는 동안 오류가 발생했습니다.', Colors.Red)], ephemeral: true });
            }
        } catch (error) {
            console.error('API 요청 실패:', error);
            return await interaction.reply({ embeds: [createEmbed('오류 발생', '사용자를 추방하는 동안 오류가 발생했습니다.', Colors.Red)], ephemeral: true });
        }
    }
}).toJSON();

// Embed 생성 함수
function createEmbed(title, description, color) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
}
