const { ChatInputCommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'status',
        description: 'API 상태를 확인합니다.',
        type: 1,
        options: []
    },
    options: {
        cooldown: 10000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {getData} api
     */
    run: async (client, interaction) => {
        const result = await client.api.getData('status');

        if (result.status) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('API 상태')
                        .setDescription('API 서버가 정상적으로 작동중입니다.')
                        .setColor(Colors.Green)
                ]
            });
        } else {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('API 상태')
                        .setDescription('API 서버가 작동하지 않습니다.')
                        .setColor(Colors.Red)
                ]
            });
        }
    }
}).toJSON();