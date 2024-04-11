const { SlashCommandBuilder } = require('discord.js');
const { APIUrls, handleError, createAndSendEmbed } = require('../utils/Globals');

const menu = {
    'add': addLeagueInfo,
    'remove': removeLeagueInfo
}

async function addLeagueInfo(interaction) {
    await createAndSendEmbed(interaction, 0x00FF00, 'League Info', null,
        "Welcome everyone!\n\n" +
        "* This league will be a multiple year franchise.\n" +
        "* We will be doing a Fantasy draft.\n\n" +
        "**League name:** HomeGrown\n" +
        "**League password:** HG123",
        false, { messageType: "reply" });
    //await createAndSendEmbed(interaction, 0x00FF00, 'Cat', null, null, false, { messageType: "reply" }, { image: image_url });
}

async function removeLeagueInfo(interaction) {
    //await createAndSendEmbed(interaction, 0x00FF00, 'Dog', null, null, false, { messageType: "reply" }, { image: image_url });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('league_info')
        .setDescription('Post league info embed')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Generate the league info embed and post it in the channel the command was used in.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove the league info embed from the channel the command was used in.')
        ),
    async execute(interaction) {
        try {
            const subCommand = interaction.options.getSubcommand();

            if (menu[subCommand]) {
                console.log(`Running ${interaction.commandName}::${subCommand}`);
                await menu[subCommand](interaction);
            } else {
                await createAndSendEmbed(interaction, 0xFF0000, 'Command not found', null, `${interaction.commandName}::${subCommand}`, true);
            }
        } catch (error) {
            await handleError(interaction, error);
        }
    },
};
