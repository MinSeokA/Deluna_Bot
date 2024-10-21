const { Client, Collection, Partials } = require("discord.js");
const CommandsHandler = require("./handler/CommandsHandler");
const { warn, error, info, success } = require("../utils/Console");
const config = require("../config");
const CommandsListener = require("./handler/CommandsListener");
const ComponentsHandler = require("./handler/ComponentsHandler");
const ComponentsListener = require("./handler/ComponentsListener");
const EventsHandler = require("./handler/EventsHandler");
const { QuickYAML } = require('quick-yaml.db');
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YouTubePlugin } = require("@distube/youtube");
class DiscordBot extends Client {
    collection = {
        application_commands: new Collection(),
        message_commands: new Collection(),
        message_commands_aliases: new Collection(),
        components: {
            buttons: new Collection(),
            selects: new Collection(),
            modals: new Collection(),
            autocomplete: new Collection()
        }
    }
    rest_application_commands_array = [];
    login_attempts = 0;
    login_timestamp = 0;
    statusMessages = [
        { name: 'Lunaiz - Deluna Bot', type: 4 },
        { name: 'Lunaiz - Deluna Bot', type: 4 },
        { name: 'Lunaiz - Deluna Bot', type: 4 },
        { name: 'Lunaiz - Deluna Bot', type: 4 },
    ];

    commands_handler = new CommandsHandler(this);
    components_handler = new ComponentsHandler(this);
    events_handler = new EventsHandler(this);
    database = new QuickYAML(config.database.path);


    /**
     * 
     * @type {import('../utils/delunaApi')}
     * @memberof DiscordBot
     * @readonly
     * @instance
     * @name api
    */
    api = new require('../utils/delunaApi');

        /**
     * Distube 음악 플레이어
     * @type {import("distube").DisTube}
     * @memberof DiscordBot
     * @readonly
     * @instance
     * @name music
     */
        music = new DisTube(this, {
            emitNewSongOnly: true,
            emitAddSongWhenCreatingQueue: true,
            emitAddListWhenCreatingQueue: true,
            ffmpeg: {
                path: require('@ffmpeg-installer/ffmpeg').path
            },
            plugins: [
                new SpotifyPlugin({
                    api: {
                        clientId: process.env.SPOTIFY_CLIENT_ID,
                        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
                    },
                }),
                new SoundCloudPlugin(),
                new YouTubePlugin(),
            ],
        });

        
    constructor() {
        super({
            intents: 3276799,
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.User
            ],
            presence: {
                activities: [{
                    name: 'Deluna',
                    type: 4,
                    state: 'Deluna',
                }]
            }
        });
        new CommandsListener(this);
        new ComponentsListener(this);
    }

    startStatusRotation = () => {
        let index = 0;
        setInterval(() => {
            this.user.setPresence({ activities: [this.statusMessages[index]] });
            index = (index + 1) % this.statusMessages.length;
        }, 4000);
    }

    connect = async () => {
        warn(`디스코드 봇에 연결을 시도하고 있습니다... (${this.login_attempts + 1})`);

        this.login_timestamp = Date.now();

        try {
            await this.login(process.env.CLIENT_TOKEN);

            this.commands_handler.load();
            this.components_handler.load();
            this.events_handler.load();
            this.startStatusRotation();

            warn('애플리케이션 커맨드를 등록하려고 시도하고 있습니다... (조금 시간이 걸릴 수 있습니다!)');
            await this.commands_handler.registerApplicationCommands(config.development);
            success('애플리케이션 커맨드가 성공적으로 등록되었습니다. 개발자 모드가 ' + (config.development.enabled ? '활성화 되어 있습니다.' : '비활성화 되어 있습니다.'));
        } catch (err) {
            error('디스코드 봇에 연결하는 데 실패했습니다. 재시도합니다...');
            error(err);
            this.login_attempts++;
            setTimeout(this.connect, 5000);
        }
    }
}

module.exports = DiscordBot;
