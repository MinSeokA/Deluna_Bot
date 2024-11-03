const config = {
    database: {
        path: './database.yml' // 데이터베이스 경로.
    },
    api: {
        baseURL: 'http://localhost:3000', // Deluna API의 기본 URL.
        dev: {
            baseURL: 'http://localhost:3000' // Deluna API의 개발 URL.
        }
    },
    development: {
        enabled: true, // true일 경우, 봇이 특정 길드에 모든 애플리케이션 커맨드를 등록합니다 (전역이 아님).
        guildId: '1233056873100476516',
    },
    commands: {
        prefix: '?', // 메시지 커맨드를 위한 접두사가 필요합니다. 이는 데이터베이스를 통해 변경할 수 있습니다.
        message_commands: true, // true일 경우, 봇이 사용자에게 메시지(또는 접두사) 커맨드를 사용할 수 있도록 허용합니다.
        application_commands: {
            chat_input: true, // true일 경우, 봇이 사용자에게 채팅 입력(또는 슬래시) 커맨드를 사용할 수 있도록 허용합니다.
            user_context: true, // true일 경우, 봇이 사용자에게 사용자 컨텍스트 메뉴 커맨드를 사용할 수 있도록 허용합니다.
            message_context: true // true일 경우, 봇이 사용자에게 메시지 컨텍스트 메뉴 커맨드를 사용할 수 있도록 허용합니다.
        }
    },
    users: {
        ownerId: '676698032565256192', // 봇 소유자 ID, 당신의 ID입니다.
        developers: ['676698032565256192'] // 봇 개발자들, 당신의 계정 ID와 다른 계정 ID를 포함해야 합니다.
    },
    messages: { // 애플리케이션 커맨드 및 메시지 커맨드 핸들러를 위한 메시지 설정.
        NOT_BOT_OWNER: '이 명령을 실행할 권한이 없습니다. 당신은 저의 소유자가 아닙니다!',
        NOT_BOT_DEVELOPER: '이 명령을 실행할 권한이 없습니다. 당신은 저의 개발자가 아닙니다!',
        NOT_GUILD_OWNER: '이 명령을 실행할 권한이 없습니다. 당신은 길드 소유자가 아닙니다!',
        CHANNEL_NOT_NSFW: '이 명령은 NSFW 채널에서 실행할 수 없습니다!',
        MISSING_PERMISSIONS: '이 명령을 실행할 권한이 없습니다. 권한이 부족합니다.',
        COMPONENT_NOT_PUBLIC: '당신은 이 버튼의 저자가 아닙니다!',
        GUILD_COOLDOWN: '현재 쿨다운 상태입니다. \`%cooldown%s\` 후에 다시 이 명령을 사용할 수 있습니다.'
    }
}

module.exports = config;
