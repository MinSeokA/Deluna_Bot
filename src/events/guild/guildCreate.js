const { success } = require("../../utils/Console");
const Event = require("../../structure/Event");
const axios = require("axios");
const config = require("../../config");

module.exports = new Event({
    event: 'guildCreate', // 길드 생성 이벤트
    once: false, // 한 번만 실행되는 것이 아니라 여러 번 실행되게 설정
    run: async (__client__, guild) => {
        success('길드가 추가되었습니다: ' + guild.name);

        // 길드 정보를 수집
        const guildData = {
            guildId: guild.id,
            prefix: '?', // 기본 프리픽스 설정
            ownerId: guild.ownerId,
        };

        try {
            // API 호출
            const response = await __client__.api.postData('guilds/create', {
                ...guildData,
            });
            console.log(`길드 정보가 성공적으로 저장되었습니다: ${response.data}`);
        } catch (error) {
            console.error('길드 정보를 저장하는 중 오류 발생:', error);
        }
    }
}).toJSON();
