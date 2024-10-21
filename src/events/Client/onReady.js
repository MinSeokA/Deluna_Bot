const { success } = require("../../utils/Console");
const Event = require("../../structure/Event");
const axios = require('axios');
const config = require("../../config");

module.exports = new Event({
    event: 'guildCreate',
    once: false, // 이 이벤트는 여러 번 발생할 수 있으므로 false로 설정
    run: async (__client__, guild) => {
        const guildData = {
            guildId: guild.id,
            prefix: '?', // 기본 프리픽스 설정
            ownerId: guild.ownerId,
        };

        try {
            // API 호출
            const response = __client__.api.postData('guild/create', {
                ...guildData,
            });
            success(`길드 정보가 성공적으로 저장되었습니다: ${response.data}`);
        } catch (error) {
            console.error('길드 정보를 저장하는 중 오류 발생:', error.response ? error.response.data : error.message);
        }
    }
}).toJSON();
