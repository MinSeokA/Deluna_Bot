require('dotenv').config(); // .env 파일에서 환경 변수 로드
const axios = require('axios');
const { success, warn } = require('./Console');
const client = require('../index');
let attempts = 0;
let isConnected = false;  // 연결 상태 추적 변수

const webhookUrl = process.env.API_STATUS_WEBHOOK_URL;

// 디스코드 웹훅 임베드 메시지 전송 함수
const sendDiscordWebhook = (title, description, color) => {
    axios.post(webhookUrl, {
        embeds: [{
            title: title,
            description: description,
            color: color // 성공: 초록색(3066993), 경고: 노란색(15105570), 오류: 빨간색(15158332)
        }]
    })
    .catch((err) => warn(`Failed to send webhook: ${err.message}`));
};

const checkAPIConnection = () => {
    client.api.getData('status')
        .then((data) => {
            if (data.status && !isConnected) { // 처음 연결 성공 시
                const successMessage = `API 서버가 정상적으로 연결되었습니다. (상태 코드: ${data.status})`;
                success(successMessage);
                sendDiscordWebhook("API 서버 연결 성공", successMessage, 3066993); // 초록색

                isConnected = true;
                clearInterval(retryInterval); // 5초 재시도 중지
                setInterval(checkPeriodicConnection, 10 * 60 * 1000); // 10분 간격으로 상태 확인
            } else if (!data.status && !isConnected) { // 연결이 아직 안되었을 때
                const warnMessage = `API 서버가 응답하지 않습니다. (상태 코드: ${data.status})`;
                warn(warnMessage);
                sendDiscordWebhook("API 서버 응답 없음", warnMessage, 15105570); // 노란색
            }
        })
        .catch((err) => {
            if (!isConnected) { // 연결 중인 상태 메시지 출력
                const connectingMessage = `API 서버에 연결하고 있습니다. (${attempts + 1})`;
                warn(connectingMessage);
                sendDiscordWebhook("API 서버 연결 시도", connectingMessage, 15105570); // 노란색
                attempts++;
            }
        });
};

// 연결이 완료된 후 10분마다 주기적으로 상태를 확인
const checkPeriodicConnection = () => {
    client.api.getData('status')
        .then((data) => {
            if (data.status) {
                const connectedMessage = `API 서버가 정상적으로 연결되어 있습니다. (상태 코드: ${data.status})`;
                success(connectedMessage);
            } else {
                const disconnectedMessage = `API 서버가 응답하지 않습니다. (상태 코드: ${data.status})`;
                warn(disconnectedMessage);
                sendDiscordWebhook("API 서버 응답 없음", disconnectedMessage, 15158332); // 빨간색

                isConnected = false;
                retryInterval = setInterval(checkAPIConnection, 5000); // 5초 재시도 시작
            }
        })
        .catch((err) => {
            const errorMessage = `API 서버 연결 확인 중 오류 발생: ${err.message}`;
            warn(errorMessage);
            sendDiscordWebhook("API 서버 연결 확인 오류", errorMessage, 15158332); // 빨간색
        });
};

// 첫 API 연결 시도
checkAPIConnection();

// 연결 실패 시 5초마다 재시도
let retryInterval = setInterval(checkAPIConnection, 5000);

