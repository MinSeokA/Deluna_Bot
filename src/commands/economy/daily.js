const { ChatInputCommandInteraction, EmbedBuilder, Colors, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: "출석체크",
    description: "출석체크를 합니다.",
  },
  /**
   * 
   * @param {DiscordBot} client 
   * @param {ChatInputCommandInteraction} interaction 
   */
  run: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const result = await client.api.getData(`economy/checkin/${interaction.guildId}/${interaction.user.id}`);

    if (result.status) {
      const { checkInReward } = result.data;      

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("출석체크")
            .setDescription(`
            > ${result.message}

            💰 보상: ${checkInReward} 코인`)
            .setColor(0x00FF00)
        ],
        ephemeral: true
      });
    } else {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("출석체크")
            .setDescription(`**${result.message}**`)
            .setColor(0xFF0000)
        ],
        ephemeral: true
      });
    }
  }
}).toJSON();
