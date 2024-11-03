const { EmbedBuilder, Colors } = require("discord.js");
const Event = require("../../structure/Event");
const { Client, ButtonInteraction } = require("discord.js");

module.exports = new Event({
    event: 'interactionCreate',
    /**
     * 
     * @param {Client} __client__ 
     * @param {ButtonInteraction} interaction 
     */
    run: async (__client__, interaction) => {
        if (!interaction.isButton()) return;

        const customId = interaction.customId; // custom ID 로깅
        const giveawayId = customId.split('_')[1]; // 이벤트 ID 추출

        try {
            // API에서 이벤트 정보 조회
            const response = await __client__.api.getData(`giveaway/${giveawayId}`);
            const participants = response.data.participants || [];

            // 이미 참가한 사용자인지 확인
            if (participants.includes(interaction.user.id)) {
                return interaction.reply({ content: "이미 이벤트에 참가하셨습니다.", ephemeral: true });
            }

            // 참가자를 데이터베이스에 추가
            participants.push(interaction.user.id); // 기존 참가자 배열에 새 사용자 ID 추가
            await __client__.api.postData(`giveaway/${giveawayId}/register`, {
                participants // 전체 참가자 배열 전송
            });

            // 참가자 수를 업데이트하기 위해 기존 메시지를 찾아 임베드를 수정
            const channel = interaction.channel; // 현재 채널 가져오기
            const messageId = response.data.messageId; // 메시지 ID 가져오기
            const message = await channel.messages.fetch(messageId); // 메시지 가져오기
            const endTime = Math.floor(new Date(response.data.endDate).getTime() / 1000); // UNIX 타임스탬프 (초 단위)

            // 수정할 임베드 생성
            const updatedEmbed = new EmbedBuilder()
                .setTitle(response.data.title)
                .setDescription(`
                    🎉 **이벤트 참여하기**

                    > 이벤트 기간: <t:${endTime}:R>
                    > 당첨자 수: ${response.data.winnerCount}
                    > 참여자 현황: ${participants.length}명

                    🎁 **상품**
                    > ${response.data.prize}

                    🎉 **참여 방법**
                    > 이벤트에 참여하려면 아래 버튼을 클릭하세요.
                `)
                .setColor(Colors.Blue);

            // 메시지 임베드 수정
            await message.edit({ embeds: [updatedEmbed], components: [
                {
                    type: 1,
                    components: [{
                        type: 2, // Button
                        custom_id: `giveaway.register.button_${response.data.id}`,
                        label: '이벤트 참여하기',
                        style: 3,
                    }]
                }
            ] });

            await interaction.reply({ content: "이벤트에 성공적으로 참여하였습니다!", ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "이벤트 참가 처리 중 오류가 발생했습니다.", ephemeral: true });
        }
    }
}).toJSON();
