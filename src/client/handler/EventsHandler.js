const { info, error, success } = require('../../utils/Console');
const { readdirSync } = require('fs');
const DiscordBot = require('../DiscordBot');
const Component = require('../../structure/Component');
const AutocompleteComponent = require('../../structure/AutocompleteComponent');
const Event = require('../../structure/Event');

class EventsHandler {
    client;

    /**
     *
     * @param {DiscordBot} client 
     */
    constructor(client) {
        this.client = client;
    }

    load = () => {
        let total = 0;

        for (const directory of readdirSync('./src/events/')) {
            for (const file of readdirSync('./src/events/' + directory).filter((f) => f.endsWith('.js'))) {
                try {
                    /**
                     * @type {Event['data']}
                     */
                    const module = require('../../events/' + directory + '/' + file);

                    if (!module) continue;

                    if (module.__type__ === 5) {
                        if (!module.event || !module.run) {
                            error('이벤트를 로드할 수 없습니다: ' + file);
                            continue;
                        }

                        if (module.once) {
                            this.client.once(module.event, (...args) => module.run(this.client, ...args));
                        } else {
                            this.client.on(module.event, (...args) => module.run(this.client, ...args));
                        }

                        info(`새로운 이벤트 로드 완료: ` + file);

                        total++;
                    } else {
                        error('잘못된 이벤트 유형: ' + module.__type__ + ' (이벤트 파일: ' + file + ')');
                    }
                } catch (err) {
                    error('경로에서 이벤트를 로드할 수 없습니다: ' + 'src/events/' + directory + '/' + file);
                }
            }
        }

        success(`성공적으로 ${total}개의 이벤트를 로드했습니다.`);
    }
}

module.exports = EventsHandler;
