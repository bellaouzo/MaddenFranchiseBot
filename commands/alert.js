const { SlashCommandBuilder } = require('discord.js');
const { createAndSendEmbed, handleError, checkAdminAndReply, colors } = require('../utils/Globals');
const { ALERTS_CHANNEL_ID } = require('../config.json');

async function postAlert(interaction) {
    if (!await checkAdminAndReply(interaction)) {
        return;
    }

    const alertMessage = interaction.options.getString('message');
    const mention = interaction.options.getBoolean('mention');

    const alertsChannel = interaction.guild.channels.cache.get(ALERTS_CHANNEL_ID);

    await createAndSendEmbed(null, colors.red, 'Alert', null, alertMessage, false, { channel: alertsChannel });

    if (mention) {
        await alertsChannel.send('@everyon');
    }

    await createAndSendEmbed(interaction, colors.green, 'Alert', null, 'Alert posted successfully', true);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Post an alert to the alerts channel')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to post in the alerts channel')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('mention')
                .setDescription('Whether to mention everyone or not')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            await postAlert(interaction);
        } catch (error) {
            await handleError(interaction, error);
        }
    }
}