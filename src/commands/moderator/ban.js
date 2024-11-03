const { ChatInputCommandInteraction, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const Cache = require("../../utils/Cache"); // 캐시 모듈 임포트

const logChannelCache = new Cache(300000); // 5분 TTL로 캐시 생성

module.exports = new ApplicationCommand({
    command: {
        name: '차단',
        description: '사용자를 차단합니다.',
        default_member_permissions: `${PermissionFlagsBits.BanMembers}` | `${PermissionFlagsBits.Administrator}`,
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
                required: false
            }
        ],
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const user = interaction.options.getUser('사용자');
        const moderatorId = interaction.user.id;
        const guildId = interaction.guild.id;
        const reason = interaction.options.getString('사유') || '사유 없음';

        try {
            const botMember = await interaction.guild.members.fetch(client.user.id);
            const userMember = await interaction.guild.members.fetch(user.id);

            if (botMember.roles.highest.comparePositionTo(userMember.roles.highest) <= 0) {
                return await interaction.reply({ embeds: [createEmbed('사용자 차단 실패', '봇이 차단할 사용자보다 높은 권한을 가지고 있습니다.', Colors.Red)], ephemeral: true });
            }

            if (botMember.id === user.id) {
                return await interaction.reply({ embeds: [createEmbed('사용자 차단 실패', '봇은 자신을 차단할 수 없습니다.', Colors.Red)], ephemeral: true });
            }

            await interaction.guild.members.ban(user.id, { reason });

            const result = await client.api.postData('ban/user', { blockerId: moderatorId, blockedId: user.id, guildId, reason });

            if (result && result.status) {
                await client.logging.addModerationLog(guildId, '차단', { moderatorId, userId: user.id, reason });

                let logChannel = logChannelCache.get(guildId);
                if (!logChannel) {
                    const loggingSettings = await client.logging.getLogging(guildId);
                    if (loggingSettings && loggingSettings.data.settings.moderationLogs?.isEnabled && loggingSettings.data.settings.moderationLogs.channelId) {
                        logChannel = await interaction.guild.channels.fetch(loggingSettings.data.settings.moderationLogs.channelId);
                        if (logChannel) logChannelCache.set(guildId, logChannel);
                    }
                }

                if (logChannel) {
                    const logEmbed = createEmbed('사용자 차단 로그', `${user.tag} (${user.id}) 사용자가 차단되었습니다.`, Colors.Blue)
                        .addFields({ name: '사유', value: reason });
                    await logChannel.send({ embeds: [logEmbed] });
                }

                return await interaction.reply({ embeds: [createEmbed('사용자 차단', `${user.tag} (${user.id}) 사용자를 차단했습니다.`, Colors.Green).addFields({ name: '사유', value: reason })] });
            } else {
                return await interaction.reply({ embeds: [createEmbed('사용자 차단 실패', result.message || '사용자를 차단하는 동안 오류가 발생했습니다.', Colors.Red)], ephemeral: true });
            }
        } catch (error) {
            console.error('API 요청 실패:', error);
            return await interaction.reply({ embeds: [createEmbed('오류 발생', '사용자를 차단하는 동안 오류가 발생했습니다.', Colors.Red)], ephemeral: true });
        }
    }
}).toJSON();

function createEmbed(title, description, color) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
}
