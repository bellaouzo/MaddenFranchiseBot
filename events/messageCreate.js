const { createAndSendEmbed, colors, profanityFilterWords } = require("../utils/Globals")
const { getProfanityFilter, getLogsChannel } = require("../utils/ServerDatabaseManager")

const onMessageCreate = async (message) => {
    console.log(message)
}

module.exports = {
    run: onMessageCreate,
}