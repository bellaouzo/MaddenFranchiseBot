const {SlashCommandBuilder} = require('discord.js');
const {APIUrls, handleError, createAndSendEmbed} = require('../utils/Globals');

const menu = {
    'add': addRulesEmbed,
    'remove': removeRulesEmbed
}

async function addRulesEmbed(interaction) {
    await createAndSendEmbed(interaction, 0x00FF00, 'Rules', null, "**League:**\n" +
        "* 24 HR Sim\n" +
        "* 7 Min Quarters\n" +
        "* Game Style: Competitive\n" +
        "* Play Cooldown: 1\n" +
        "\n" +
        "**CHAT:**\n" +
        "* Must change name to team name\n" +
        "\n" +
        "**4TH Down Rules:**\n" +
        "* 1ST, 2ND and 3RD Quarter:\n" +
        "  * Past 50, 4th and 5 or less you can go for it\n" +
        "* 4TH Quarter:\n" +
        "  * No 4th down rules\n" +
        "  * Unless you are up 21+ you must punt/fg attempt on 4th down\n" +
        "  * Last 2 mins of 3rd n 4th u can chew clock\n" +
        "\n" +
        "**SCHEDULING:**\n" +
        "* Scheduling Games Are Amongst the users.\n" +
        "* We Will Be Playing one Game Every 24 hr. We Will Sim Every 24 hr @ 10pm MST\n" +
        "* You can play the cpu 1 time. If you are caught playing more than once, then you will be getting a force loss.\n" +
        "* If you are Scheduling a game with another User and they don’t respond. Send an admin proof and we will give you the force win.\n" +
        "* If Both Teams Can't Play, A Fair Sim Will Be Done.\n" +
        "\n" +
        "**FREE AGENCY RULES:**\n" +
        "* Limited to 2 XF & SSs\n" +
        "* Stars & normals unlimited\n" +
        "\n" +
        "**TRADING RULES:**\n" +
        "* All trades must go through trade approval and get approved by trade committee\n" +
        "* Do not send trades through madden until one of the commissioners has put the trade in approved trades chat\n" +
        "* Once a trade is agreed upon and Approved by Trade committee there is NO GOING BACK\n" +
        "* No dumb trades because they will get DENIED and No CPU TRADES\n" +
        "\n" +
        "**QUITTING:**\n" +
        "* Must not quit out or other team receives a reward",
        false, {messageType: "reply"});
    //await createAndSendEmbed(interaction, 0x00FF00, 'Cat', null, null, false, { messageType: "reply" }, { image: image_url });
}

async function removeRulesEmbed(interaction) {
    //await createAndSendEmbed(interaction, 0x00FF00, 'Dog', null, null, false, { messageType: "reply" }, { image: image_url });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Post league rules embed')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Generate the rules embed in the channel the command was used in.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove the rules embed from the channel the command was used in.')
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
