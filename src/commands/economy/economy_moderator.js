const { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, Colors, Embed } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: "경제관리",
    description: "경제를 관리합니다.",
    default_member_permissions: `${PermissionFlagsBits.Administrator}` || `${PermissionFlagsBits.ManageGuild}`,
    // 옵션추가 경제 관리 추가, 수정, 삭제
    options: [
      {
        type: 1, // SUB_COMMAND
        name: "출석체크보상",
        description: "출석체크 보상을 변경합니다.",
      }
    ]
  },
  /**
   * 
   * @param {DiscordBot} client 
   * @param {ChatInputCommandInteraction} interaction 
   */
  run: async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand();

    switch (subCommand) {
      case "출석체크보상":
        // 출석체크 보상 설정
        await interaction.showModal({
          custom_id: "setCheckinReward",
          title: "출석체크 보상 설정",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: "checkIn-reward",
                  label: "보상",
                  placeholder: "보상을 입력하세요!",
                  style: 1,
                  required: true
                }
              ]
            }
          ]
        });
        break;
    }
  }
}).toJSON();