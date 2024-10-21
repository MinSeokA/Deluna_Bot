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

        // Embed
        const embed = new EmbedBuilder()
            .setTitle('API 상태')
            .setDescription(result.status ? 'API가 정상적으로 작동 중입니다.' : 'API가 작동하지 않습니다.')
            .setColor(result.status ? Colors.Green : Colors.Red)
            .setTimestamp();
        
        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}).toJSON();