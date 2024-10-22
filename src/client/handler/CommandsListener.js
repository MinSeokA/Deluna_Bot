const { PermissionsBitField, ChannelType, EmbedBuilder, Colors } = require("discord.js");
const DiscordBot = require("../DiscordBot");
const config = require("../../config");
const MessageCommand = require("../../structure/MessageCommand");
const { handleMessageCommandOptions, handleApplicationCommandOptions } = require("./CommandOptions");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const { error } = require("../../utils/Console");

class CommandsListener {
    /**
     * 
     * @param {DiscordBot} client 
     */
    constructor(client) {
        client.on('messageCreate', async (message) => {
            if (message.author.bot || message.channel.type === ChannelType.DM) return;

            if (!config.commands.message_commands) return;

            try {
                let prefix = client.api.getData(`guilds/${message.guild.id}`).prefix

                if (!message.content.startsWith(prefix)) return;

                const args = message.content.slice(prefix.length).trim().split(/\s+/g);
                const commandInput = args.shift().toLowerCase();

                if (!commandInput.length) return;

                /**
                 * @type {MessageCommand['data']}
                 */
                const command =
                    client.collection.message_commands.get(commandInput) ||
                    client.collection.message_commands.get(client.collection.message_commands_aliases.get(commandInput));

                if (!command) return;

                try {
                    if (command.options) {
                        const commandContinue = await handleMessageCommandOptions(message, command.options, command.command);

                        if (!commandContinue) return;
                    }

                    if (command.command?.permissions && !message.member.permissions.has(PermissionsBitField.resolve(command.command.permissions))) {
                        await message.reply({
                            content: config.messages.MISSING_PERMISSIONS,
                            ephemeral: true
                        });

                        return;
                    }

                    command.run(client, message, args);
                } catch (err) {
                    error(err);
                }
            } catch (err) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('오류 발생')
                            .setDescription('API에서 접두사를 불러오는 도중 오류가 발생했습니다.')
                            .setColor(Colors.Red)
                            .setTimestamp()
                            .setFooter({
                                text: message.author.tag,
                                iconURL: message.author.displayAvatarURL()
                            })
                    ]
                });
            }
        });

        client.on('interactionCreate', async (interaction) => {
            if (!interaction.isCommand()) return;

            if (!config.commands.application_commands.chat_input && interaction.isChatInputCommand()) return;
            if (!config.commands.application_commands.user_context && interaction.isUserContextMenuCommand()) return;
            if (!config.commands.application_commands.message_context && interaction.isMessageContextMenuCommand()) return;

            /**
             * @type {ApplicationCommand['data']}
             */
            const command = client.collection.application_commands.get(interaction.commandName);

            if (!command) return;

            try {
                if (command.options) {
                    const commandContinue = await handleApplicationCommandOptions(interaction, command.options, command.command);

                    if (!commandContinue) return;
                }

                command.run(client, interaction);
            } catch (err) {
                error(err);
            }
        });
    }
}

module.exports = CommandsListener;