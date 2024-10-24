const { success } = require("../../utils/Console");
const Event = require("../../structure/Event");
const { PlayerEvents } = require("../../utils/Lavalink");

module.exports = new Event({
    event: 'ready',
    once: true,
    run: (__client__, client) => {
        success('로그인 성공: ' + client.user.displayName + ', 소요 시간: ' + ((Date.now() - __client__.login_timestamp) / 1000) + "초.")

        __client__.music.init(__client__.user);

        __client__.music.nodeManager.on("create", (node, payload) => {
            success(`라바링크 노드 #${node.id}가 연결되었습니다.`);
        });

        __client__.music.nodeManager.on("connect", (node, payload) => {
            success(`라바링크 노드 #${node.id}가 연결되었습니다.`);
        });

        __client__.music.nodeManager.on("error", (node, error, payload) => {
            error(`라바링크 노드 #${node.id}에서 오류가 발생했습니다: ${error.message}`);
            error(`Error-Payload: `, payload)

        });
        PlayerEvents(client);


    }
}).toJSON();
