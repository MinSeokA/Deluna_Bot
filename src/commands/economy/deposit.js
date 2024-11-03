// 입금
const { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, Colors, Embed } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const Cache = require("../../utils/Cache"); // 캐시 모듈 임포트

const logChannelCache = new Cache(300000); // 5분 TTL로 캐시 생성

module.exports = new ApplicationCommand({
  command: {
    name: "입금",
    description: "돈을 입금합니다.",
    options: [
      {
        type: 4, // INTEGER
        name: "금액",
        description: "입금할 금액을 입력하세요.",
        required: true
      }
    ]
  },
  /**
   * 
   * @param {DiscordBot} client 
   * @param {ChatInputCommandInteraction} interaction 
   */
  run: async (client, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });


      const user = interaction.user;
      const guildId = interaction.guildId;
      const amount = interaction.options.getInteger('금액');

      // db에 저장된 사용자의 돈을 가져옴
      const userEconomy = await client.api.getData(`economy/balance/${guildId}/${user.id}`).then((Economy) => {
        if (Economy.status) {
          return Economy.data;
        } else {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle("입금 실패")
                .setDescription(`**${Economy.message || `오류가 발생하여 입금을 실패했습니다.`}**`)
                .setColor(Colors.Red)
            ],
            ephemeral: true
          })
        }
      })
      if (amount <= 0) {
        return interaction.editReply({ embeds: [createEmbed('입금 실패', '0보다 큰 금액을 입력해주세요.', Colors.Red)], ephemeral: true });
      } else if (amount > userEconomy.balance) {
        return interaction.editReply({ embeds: [createEmbed('입금 실패', '소지하고 있는 금액보다 많은 금액을 입금할 수 없습니다.', Colors.Red)], ephemeral: true });
      } else if (amount > 100000000) {
        return interaction.editReply({ embeds: [createEmbed('입금 실패', '최대 100,000,000 코인까지 입금할 수 있습니다.', Colors.Red)], ephemeral: true });
      }

      const result = await client.api.postData('economy/deposit', {
        userId: user.id,
        guildId,
        amount: amount
      })

      if (result.status) {
        // 캐시 사용 및 로그 생성
        await client.logging.addEconomyLog(guildId, '입금', { userId: user.id, amount });

        let logChannel = logChannelCache.get(guildId);
        if (!logChannel) {
          const loggingSettings = await client.logging.getLogging(guildId);
          if (loggingSettings && loggingSettings.data.settings.economyLogs?.isEnabled && loggingSettings.data.settings.economyLogs.channelId) {
            logChannel = await interaction.guild.channels.fetch(loggingSettings.data.settings.economyLogs.channelId);
            if (logChannel) logChannelCache.set(guildId, logChannel);
          }
        }

        if (logChannel) {
          const logEmbed = createEmbed('입금 로그', `사용자가 은행에 ${amount.toLocaleString()} 코인을 입금하였습니다.`, Colors.Blue).setFooter({ text: `${user.tag} (${user.id})`, iconURL: user.displayAvatarURL() });
          await logChannel.send({ embeds: [logEmbed] });
        }


        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("입금 완료")
              .setDescription(`성공적으로 ${amount.toLocaleString()} 코인을 입금했습니다.`)
              .setColor(Colors.Green)
          ],
          ephemeral: true
        });
      } else {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("입금 실패")
              .setDescription(`**${result.message || `오류가 발생하여 입금을 실패했습니다.`}**`)
              .setColor(Colors.Red)
          ],
          ephemeral: true
        });
      }
    } catch (error) {
      console.error(error);
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
