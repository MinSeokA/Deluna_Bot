const axios = require('axios');
const config = require('../config.js');

class API {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL,
            timeout: 5000, // 요청 타임아웃 (5초)
        });
    }

    /**
     * GET 요청을 보내고 데이터를 가져옵니다.
     * @param {string} parameter - 요청할 파라미터
     * @param {Object} query - 쿼리(옵션) 데이터
     * @returns {Promise<Object>} - 응답 데이터
     */
    async getData(parameter) {
        try {
            const response = await this.api.get(`/${parameter}`);
            return response.data; // 응답 데이터를 반환
        } catch (error) {
            console.error('API 요청 실패:', error);
            throw error; // 에러를 호출자에게 전달
        }
    }

    /**
     * POST 요청을 보내고 데이터를 보냅니다.
     * @param {string} parameter - 요청할 파라미터
     * @param {Object} data - 보낼 JSON 데이터
     * @returns {Promise<Object>} - 응답 데이터
     */
    async postData(parameter, data) {
        try {
            const response = await this.api.post(`/${parameter}`, {
                ...data
            });
            return response.data; // 응답 데이터를 반환
        } catch (error) {
            console.error('API 요청 실패:', error);
            throw error; // 에러를 호출자에게 전달
        }
    }
}

const api = new API(config.development.enabled ? config.api.dev.baseURL : config.api.baseURL);

module.exports = api;
