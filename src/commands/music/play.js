const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const { info } = require("../../utils/Console");

module.exports = new ApplicationCommand({
    command: {
        name: '재생',
        description: '음악을 재생합니다.',
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {

        // 선택메뉴
        const embed = new EmbedBuilder()
        .setTitle("음악을 재생할 소스(플랫폼)을 선택해주세요.")
        .setDescription(`
        > 1️⃣ YouTube
        > 2️⃣ SoundCloud
        > 3️⃣ Spotify
        > 4️⃣ Youtube Music
        > 5️⃣ Deezer (개발중)
        > 6️⃣ Apple Music (개발중)

        
        `)
        .setColor(Colors.Blue)


        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 3, // String Select Menu
                            custom_id: 'play.select',
                            placeholder: '음악을 재생할 소스(플랫폼)을 선택해주세요.',
                            options: [
                                {
                                    label: 'YouTube',
                                    value: 'ytsearch',
                                    description: 'YouTube에서 음악을 검색합니다.',
                                },
                                {
                                    label: 'SoundCloud',
                                    value: 'scsearch',
                                    description: 'SoundCloud에서 음악을 검색합니다.',
                                },
                                {
                                    label: 'Spotify',
                                    value: 'spsearch',
                                    description: 'Spotify에서 음악을 검색합니다.',
                                },
                                {
                                    label: 'Youtube Music',
                                    value: 'ymsearch',
                                    description: 'Youtube Music에서 음악을 검색합니다.',
                                },
                            ]
                        }
                    ]
                }
            ]

        })  
    },
}).toJSON();
