const { info, error, success } = require('../../utils/Console');
const { readdirSync } = require('fs');
const DiscordBot = require('../DiscordBot');
const Component = require('../../structure/Component');
const AutocompleteComponent = require('../../structure/AutocompleteComponent');

class ComponentsHandler {
    client;

    /**
     *
     * @param {DiscordBot} client 
     */
    constructor(client) {
        this.client = client;
    }

    load = () => {
        for (const directory of readdirSync('./src/components/')) {
            for (const file of readdirSync('./src/components/' + directory).filter((f) => f.endsWith('.js'))) {
                try {
                    /**
                     * @type {Component['data'] | AutocompleteComponent['data']}
                     */
                    const module = require('../../components/' + directory + '/' + file);

                    if (!module) continue;

                    if (module.__type__ === 3) {
                        if (!module.customId || !module.type || !module.run) {
                            error('버튼/선택/모달 컴포넌트를 로드할 수 없습니다: ' + file);
                            continue;
                        }

                        switch (module.type) {
                            case 'modal': {
                                this.client.collection.components.modals.set(module.customId, module);
                                break;
                            }
                            case 'select': {
                                this.client.collection.components.selects.set(module.customId, module);
                                break;
                            }
                            case 'button': {
                                this.client.collection.components.buttons.set(module.customId, module);
                                success(`Loaded button customId: ${module.customId}`); // 실제 customId 출력
                                break;
                            }
                            default: {
                                error('잘못된 컴포넌트 유형(버튼, 선택 또는 모달 아님): ' + file);
                                continue;
                            }
                        }

                        info(`새로운 컴포넌트 로드 완료 (유형: ${module.type}): ` + file);
                    } else if (module.__type__ === 4) {
                        if (!module.commandName || !module.run) {
                            error('자동 완성 컴포넌트를 로드할 수 없습니다: ' + file);
                            continue;
                        }

                        this.client.collection.components.autocomplete.set(module.commandName, module);

                        info(`새로운 컴포넌트 로드 완료 (유형: 자동 완성): ` + file);
                    } else {
                        error('잘못된 컴포넌트 유형: ' + module.__type__ + ' (컴포넌트 파일: ' + file + ')');
                    }
                } catch {
                    error('경로에서 컴포넌트를 로드할 수 없습니다: ' + 'src/component/' + directory + '/' + file);
                }
            }
        }

        const componentsCollection = this.client.collection.components;

        success(`성공적으로 ${componentsCollection.autocomplete.size + componentsCollection.buttons.size + componentsCollection.selects.size + componentsCollection.modals.size}개의 컴포넌트를 로드했습니다.`);
    }

    reload = () => {
        this.client.collection.components.autocomplete.clear();
        this.client.collection.components.buttons.clear();
        this.client.collection.components.modals.clear();
        this.client.collection.components.selects.clear();

        this.load();
    }
}

module.exports = ComponentsHandler;
