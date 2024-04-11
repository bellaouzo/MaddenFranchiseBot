const startTime = Date.now();

const fs = require('node:fs')
const path = require('node:path')
const commandsPath = path.join(__dirname, 'commands')
const eventsPath = path.join(__dirname, 'events')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'))
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { TOKEN, DEFAULT_ACTIVITY } = require('./config.json');

/*const actionHandlers = {
    // 'button_name': functionName,
}*/

const client = new Client({
    intents: [
        GatewayIntentBits["Guilds"],
        GatewayIntentBits["GuildMessages"],
        GatewayIntentBits["GuildMembers"],
        GatewayIntentBits["GuildMessageReactions"],
        GatewayIntentBits["MessageContent"],
        GatewayIntentBits["GuildBans"],
    ]
});

client.commands = new Collection()

function loadCommands() {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command)
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
        }
    }
}

function loadEvents() {
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        const eventName = file.split('.')[0];

        client.on(eventName, event.run.bind(null));
    }
}

process.on("uncaughtException", (error) => {
    console.error("An uncaught exception occurred!", error);
});

process.on("unhandledRejection", (reason) => {
    console.error("A promise rejection was unhandled!", reason);
});

/*async function handleButtonInteraction(interaction) {
    const [prefix, action, userId] = interaction.customId.split(':');

    if (prefix === 'custom' && actionHandlers[action]) {
        await actionHandlers[action](interaction, userId);
    } else {
        console.log(`Unhandled button ID: ${interaction.customId}`);
    }
}*/

loadCommands();
loadEvents();

client.on('interactionCreate', async interaction => {
    // if (interaction.isButton()) {
    //await handleButtonInteraction(interaction);
    //}
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) {
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            }
        }
    }
});

client.once(Events.ClientReady, async () => {
    const guildIds = ['1169429889586298960'];
    const endTime = Date.now();
    const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

    for (let guildId of guildIds) {
        const guild = client.guilds.cache.get(guildId);
        try {
            await guild.commands.set(client.commands.map(command => command.data));
            console.log(`Commands registered successfully for guild: ${guildId}`);
        } catch (error) {
            console.error(`Failed to update guild commands for guild: ${guildId}`, error);
        }
    }

    client.user.setActivity(DEFAULT_ACTIVITY);

    console.log(`Startup sequence completed in ${timeTaken} seconds.`)
});

(async () => {
    try {
        await client.login(TOKEN);
    } catch (error) {
        console.log(`Startup Error: ${error}`);
    }
})();