const axios = require('axios');
const config = require('../config.js');

class LoggingAPI {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL,
            timeout: 5000, // 요청 타임아웃 (5초)
        });
    }

    /**
     * 특정 길드의 로그 설정을 가져옵니다.
     * @param {string} guildId - 길드 ID
     * @returns {Promise<Object>} - 응답 데이터
     */
    async getLogging(guildId) {
        try {
            const response = await this.api.get(`/logging/${guildId}`);
            return response.data; // 응답 데이터를 반환
        } catch (error) {
            throw error; // 에러를 호출자에게 전달
        }
    }

    /**
     * 로그를 추가합니다. (경제 로그 및 관리 로그)
     * @param {string} guildId - 길드 ID
     * @param {string} logType - 로그 유형 (입금, 출금, 이체, 상점, 차단, 추방, 경고)
     * @param {Object} logData - 로그 데이터
     * @param {string} logCategory - 로그 카테고리 ('economyLogs' 또는 'moderationLogs')
     * @returns {Promise<Object>} - 응답 데이터
     */
    async addLog(guildId, logType, logData, logCategory) {
        const logEntry = {
            logType,
            ...logData,
            createdAt: new Date() // 현재 시간 추가
        };

        try {
            const response = await this.api.post(`/logging/${guildId}/${logCategory}`, logEntry);
            return response.data; // 응답 데이터를 반환
        } catch (error) {
            throw error; // 에러를 호출자에게 전달
        }
    }

    /**
     * 경제 로그를 추가합니다.
     * @param {string} guildId - 길드 ID
     * @param {string} logType - 로그 유형 (입금, 출금, 이체, 상점)
     * @param {Object} logData - 로그 데이터
     * @returns {Promise<Object>} - 응답 데이터
     */
    async addEconomyLog(guildId, logType, logData) {
        return await this.addLog(guildId, logType, logData, 'economy-log'); // 로그 카테고리 설정
    }

    /**
     * 관리 로그를 추가합니다.
     * @param {string} guildId - 길드 ID
     * @param {string} logType - 로그 유형 (차단, 추방, 경고)
     * @param {Object} logData - 로그 데이터
     * @returns {Promise<Object>} - 응답 데이터
     */
    async addModerationLog(guildId, logType, logData) {
        return await this.addLog(guildId, logType, logData, 'moderation-log'); // 로그 카테고리 설정
    }
}

const loggingAPI = new LoggingAPI(config.development.enabled ? config.api.dev.baseURL : config.api.baseURL);

module.exports = loggingAPI;
