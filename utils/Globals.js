const buildEmbed = require("./embedBuilder");
const { UserError } = require("./UserError");
const validAdminRoles = ['Admin', 'Bella', 'Xylo'];
const APIErrorCodes = {
    'https://api.themoviedb.org/3/search/movie': { code: 'status_code', message: 'status_message' },
    'https://api.nasa.gov/planetary/apod': { code: 'code', message: 'msg' },
    'https://api.themoviedb.org/3/movie': { code: 'status_code', message: 'status_message' }
    //add the rest of the APIs in a similar fashion
};

profanityFilterWords = [
    'fuck',
    'bitch',
    'asshole',
    'cunt',
    'pussy',
    'nigger',
    'nigga',
    'nigger',
]

colors = {
    'red': 0xff0000,
    'green': 0x00ff00,
    'yellow': 0xffff00,
    'blue': 0x0099ff,
}

coinCollections = {
    'daily': 100,
    'work': generateWorkCoins,
}

APIUrls = {
    'insult': 'https://evilinsult.com/generate_insult.php?lang=en&type=json',
    'compliment': 'https://8768zwfurd.execute-api.us-east-1.amazonaws.com/v1/compliments',
    'weather': 'https://api.weatherapi.com/v1/current.json?key=68759da8e5034fc893b90944231311&q=',
    'random_image_cat': 'https://api.thecatapi.com/v1/images/search',
    'random_image_dog': 'https://api.thedogapi.com/v1/images/search',
    'random_fact': 'https://uselessfacts.jsph.pl/random.json?language=en',
    'joke': 'https://official-joke-api.appspot.com/jokes/random',
    'quote': 'https://api.quotable.io/random',
    'advice': 'https://api.adviceslip.com/advice',
    'APOD': 'https://api.nasa.gov/planetary/apod?api_key=yfkhWBUwAH7b3liChXEP4U3PW9w6nSHEEbLJREmR&date=',
    'movie_search': 'https://api.themoviedb.org/3/search/movie',
    'movie_details': 'https://api.themoviedb.org/3/movie',
    'urban_dictionary': 'https://mashape-community-urban-dictionary.p.rapidapi.com/define',
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateWorkCoins() {
    return Math.floor(Math.random() * 20) + 30;
}

async function isAdmin(interaction) {
    if (!interaction.guild) {
        return false;
    }

    const member = await interaction.guild.members.fetch(interaction.user);
    return member.roles.cache.some(role => validAdminRoles.includes(role.name));
}

function getValueOrDefault(value, defaultValue) {
    return value == null ? defaultValue : value;
}

async function checkAdminAndReply(interaction) {
    if (!await isAdmin(interaction)) {
        const embedFields = [
            { name: 'Command', value: `${interaction.commandName}`, inline: true }
        ]

        await createAndSendEmbed(interaction, colors.red, 'Invalid Permissions', embedFields, "You must have admin permissions to run this command.", true)

        return false;
    }
    return true;
}

async function createAndSendEmbed(interaction, color, title, embedFields, description, ephemeral = false, extraMessageInfo = { messageType: "reply" }, imageOptions = {}) {
    try {
        const embedOptions = {
            color: color,
        }

        if (description) {
            embedOptions.description = description;
        }
        if (embedFields) {
            embedOptions.fields = embedFields;
        }
        if (extraMessageInfo.footer) {
            embedOptions.footer = extraMessageInfo.footer;
        }
        if (imageOptions.image) {
            embedOptions.image = imageOptions.image;
        }
        if (imageOptions.thumbnail) {
            embedOptions.thumbnail = imageOptions.thumbnail;
        }

        const embed = new buildEmbed(title, embedOptions);

        if (extraMessageInfo.messageType === "dm" && extraMessageInfo.user) {
            return await extraMessageInfo.user.send({ embeds: [embed.getEmbed()] });
        }

        if (interaction) {
            if (extraMessageInfo.messageType === "reply") {
                return await interaction.reply({ embeds: [embed.getEmbed()], ephemeral: ephemeral })
            } else if (extraMessageInfo.messageType === "followUp") {
                return await interaction.followUp({ embeds: [embed.getEmbed()], ephemeral: ephemeral })
            } else if (extraMessageInfo.messageType === "edit") {
                return await interaction.editReply({ embeds: [embed.getEmbed()] });
            }
        } else if (extraMessageInfo.channel) {
            console.log(extraMessageInfo)
            console.log("Sending message to channel " + extraMessageInfo.channel.name)
            return await extraMessageInfo.channel.send({ embeds: [embed.getEmbed()] });
        }
    } catch (error) {
        await handleError(interaction, error);
    }
}


async function handleError(interaction, error) {
    const shouldMessageBeEphemeral = error instanceof UserError;
    let errorMessage = error.message;
    let lineNumber = "";
    let filePath = "";
    let errorTitle = error instanceof UserError ? 'Command Error' : 'Error. Please send this to bellaouzo on discord.';

    if (error.message === 'Missing Permissions') {
        errorMessage = 'I do not have the required permissions to run this command on this user.';
    }

    if (error.response && error.response.config.url) {
        const errorResponse = error.response.data;
        const invokedUrl = error.response.config.url;
        const matchedAPI = Object.entries(APIErrorCodes).find(([baseUrl]) => invokedUrl.startsWith(baseUrl));

        if (matchedAPI && !(error instanceof UserError)) {
            const [_, responseCodes] = matchedAPI;
            if (responseCodes) {
                errorTitle = 'API Error';
                errorMessage = `Status Code: ${errorResponse[responseCodes.code]}\n${errorResponse[responseCodes.message]}`;
            }
        }
    }

    if (error.stack) {
        const stackLines = error.stack.split('\n');
        if (stackLines[1]) {
            const match = stackLines[1].match(/at .+ \((.+?):(\d+):\d+\)/);
            if (match) {
                filePath = match[1];
                lineNumber = match[2];
            }
        }
    }

    try {
        if (interaction.replied) {
            await interaction.fetchReply();
            await createAndSendEmbed(interaction, colors.red, errorTitle, null, errorMessage, shouldMessageBeEphemeral, { messageType: "followUp" });
        } else {
            await createAndSendEmbed(interaction, colors.red, errorTitle, null, errorMessage, shouldMessageBeEphemeral, { messageType: "reply" });
        }
    } catch (error) {
        console.log(error);
    }

    if (!(error instanceof UserError)) {
        if (filePath && lineNumber) {
            console.log('\x1b[31m%s\x1b[0m', `Error Occurred:\n${errorMessage}\nFile: ${filePath}, Line Number: ${lineNumber}`);
        } else {
            console.log('\x1b[31m%s\x1b[0m', `Error Occurred:\n${errorMessage}`);
        }
    }
}

module.exports = {
    sleep,
    checkAdminAndReply,
    createAndSendEmbed,
    handleError,
    getValueOrDefault,
    validAdminRoles,
    profanityFilterWords,
    colors,
    coinCollections,
    APIUrls,
}