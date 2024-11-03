const { ChatInputCommandInteraction, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

function parseDuration(duration) {
    const timePattern = /(\d+)(일|시간|분|초)/g;
    let totalMilliseconds = 0;

    let match;
    while ((match = timePattern.exec(duration)) !== null) {
        const value = parseInt(match[1], 10);
        const unit = match[2];

        switch (unit) {
            case '일':
                totalMilliseconds += value * 86400000;
                break;
            case '시간':
                totalMilliseconds += value * 3600000;
                break;
            case '분':
                totalMilliseconds += value * 60000;
                break;
            case '초':
                totalMilliseconds += value * 1000;
                break;
            default:
                throw new Error(`지원하지 않는 시간 단위: ${unit}`);
        }
    }

    return totalMilliseconds;
}

module.exports = new ApplicationCommand({
    command: {
        name: '이벤트',
        description: '이벤트 관리 명령어입니다.',
        default_member_permissions: `${PermissionFlagsBits.Administrator}` | `${PermissionFlagsBits.ManageGuild}`,
        type: 1,
        options: [
            {
                name: '생성',
                description: '새로운 이벤트를 만듭니다.',
                type: 1,
                options: [
                    {
                        name: '제목',
                        description: '이벤트 제목',
                        type: 3,
                        required: true
                    },
                    {
                        name: "상품",
                        description: "이벤트 상품",
                        type: 3,
                        required: true
                    },
                    {
                        name: '기간',
                        description: '이벤트 기간 (예: 1시간, 30분)',
                        type: 3,
                        required: true
                    },
                    {
                        name: '당첨자수',
                        description: '당첨자 수',
                        type: 4,
                        required: true
                    }
                ]
            },
            {
                name: '목록',
                description: '진행 중인 모든 이벤트를 확인합니다.',
                type: 1
            },
            {
                name: '종료',
                description: '진행 중인 이벤트를 종료합니다.',
                type: 1,
                options: [
                    {
                        name: '이벤트_아이디',
                        description: '종료할 이벤트의 ID',
                        type: 3,
                        required: true
                    }
                ]
            }
        ]
    },
    options: {
        cooldown: 10000
    },
    /**
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === '생성') {
                const title = interaction.options.getString('제목');
                const duration = interaction.options.getString('기간');
                const prize = interaction.options.getString('상품');
                const winners = interaction.options.getInteger('당첨자수');
                
                const embed = new EmbedBuilder()
                    .setTitle("이벤트 생성 중...")
                    .setDescription("잠시만 기다려 주세요.")
                    .setColor(Colors.Yellow);

                const endDate = new Date(Date.now() + parseDuration(duration)).toISOString();
                // 초기 메시지 응답 (ephemeral을 false로 설정)
                const initialMessage = await interaction.reply({ embeds: [embed], ephemeral: false, fetchReply: true });
                const endTime = Math.floor(new Date(endDate).getTime() / 1000); // UNIX 타임스탬프 (초 단위)
      
                // 이벤트 임베드 생성
                const eventEmbed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(`
                        🎉 **이벤트 참여하기**
                        
                        > 이벤트 기간: <t:${endTime}:R>
                        > 당첨자 수: ${winners}
                        > 참여자 현황: 0명
            
                        🎁 **상품**
                        > ${prize}
            
                        🎉 **참여 방법**
                        > 이벤트에 참여하려면 아래 버튼을 클릭하세요.
                    `)
                    .setColor(Colors.Blue);
                
                // 메시지를 전송하고 메시지 ID를 저장합니다.
                const messageId = initialMessage.id;
                
                // API에 데이터 전송
                const response = await client.api.postData('giveaway', {
                    title,
                    duration,
                    winners,
                    prize,
                    guildId: interaction.guildId,
                    channelId: interaction.channelId,
                    messageId: messageId, // 초기 메시지 ID
                    endDate: endDate
                });
                
                // 이벤트 임베드 수정 및 버튼 추가
                await initialMessage.edit({ embeds: [eventEmbed], components: [
                    {
                        type: 1,
                        components: [{
                            type: 2, // Button
                            custom_id: `giveaway.register.button_${response.data.id}`,
                            label: '이벤트 참여하기',
                            style: 3
                        }]
                    }
                ]});

                console.log(`이벤트가 성공적으로 생성되었습니다: giveaway.register.button_${response.data.id}`);

                // 자동 추첨 설정
                setTimeout(async () => {
                    await drawWinners(client, response.data.id, winners);
                }, parseDuration(duration));
            } else if (subcommand === '목록') {
                const response = await client.api.getData('giveaway');
                const giveaways = response.data;

                if (giveaways.length > 0) {
                    const embed = new EmbedBuilder()
                        .setTitle("진행 중인 이벤트")
                        .setColor(Colors.Blue);

                    giveaways.forEach(giveaway => {
                        embed.addFields({
                            name: giveaway.title,
                            value: `ID: ${giveaway.id}\n상태: ${giveaway.isEnded ? '종료' : '진행 중'}`
                        });
                    });

                    await interaction.reply({ embeds: [embed] });
                } else {
                    await interaction.reply({ content: "현재 진행 중인 이벤트가 없습니다.", ephemeral: true });
                }
            } else if (subcommand === '종료') {
                const giveawayId = interaction.options.getString('이벤트_아이디');
                await client.api.deleteData(`giveaway/${giveawayId}`);

                await interaction.reply({ content: `이벤트(ID: ${giveawayId})가 성공적으로 종료되었습니다.`, ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: "이벤트 처리 중 오류가 발생했습니다.", ephemeral: true });
        }
    }
}).toJSON();

// 자동으로 당첨자를 추첨하는 함수
async function drawWinners(client, giveawayId, numberOfWinners) {
  try {
      const response = await client.api.getData(`giveaway/${giveawayId}`);
      const participants = response.data.participants || [];
      
      if (participants.length === 0) {
          console.log(`이벤트 ID ${giveawayId}의 참가자가 없습니다.`);
          return;
      }

      const winners = [];
      const shuffledParticipants = participants.sort(() => 0.5 - Math.random());
      console.log(`당첨자: ${shuffledParticipants}`);


      for (let i = 0; i < numberOfWinners && i < shuffledParticipants.length; i++) {
          winners.push(shuffledParticipants[i]);

      }
      

      const channelId = response.data.channelId;
      const channel = await client.channels.fetch(channelId);
      const messageId = response.data.messageId; // 이벤트 임베드 메시지 ID
      const originalMessage = await channel.messages.fetch(messageId); // 원래 이벤트 메시지 가져오기

      // 당첨자 발표 내용
      const winnersMentions = winners.map(winnerId => `<@${winnerId}>`).join(', ');

      // 원래 메시지에 답장 형태로 당첨자 발표
      await originalMessage.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(response.data.title + '당첨자 발표')
            .setDescription(` 
              > 축하합니다! 당첨되신 분들은 아래와 같습니다.

              🎉 **당첨자 발표!** 🎉

              > ${winnersMentions}

              🎁 **상품**
              > ${response.data.prize}

            `
            )
            .setColor(Colors.Green)

        ]
      });

      // 이벤트 상태 업데이트
      await client.api.putData(`giveaway/${giveawayId}`, { isEnded: true });
  } catch (error) {
      console.error('추첨 중 오류 발생:', error);
  }
}
