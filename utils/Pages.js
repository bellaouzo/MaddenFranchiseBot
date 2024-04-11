const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { UserError } = require("./UserError");

console.log(`DiscordJS version: ${require("discord.js").version}`)

class Pages {
    constructor(interaction, pages, timeout = 60000, ephemeral = false) {
        if (!pages || pages.length === 0) {
            throw new UserError('No pages were provided/Nothing found to make pages out of.');
        }

        this.interaction = interaction;
        this.pages = pages;
        this.currentPage = 0;
        this.timeout = timeout;
        this.ephemeral = ephemeral;
    }

    createButtons() {
        const previousLabel = this.currentPage === 0
            ? `No Previous Page`
            : `👈 Previous`;
        const nextLabel = this.currentPage + 1 === this.pages.length
            ? 'No Next Page'
            : `Next 👉`;

        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel(previousLabel)
                    .setStyle(this.currentPage > 0 ? 'Success' : 'Danger')
                    .setDisabled(this.currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel(nextLabel)
                    .setStyle(this.currentPage < this.pages.length - 1 ? 'Success' : 'Danger')
                    .setDisabled(this.currentPage === this.pages.length - 1)
            );
    }


    async start() {
        const message = await this.interaction.reply({
            embeds: [this.pages[this.currentPage].getEmbed()],
            components: [this.createButtons()],
            ephemeral: this.ephemeral,
            fetchReply: true
        });

        const collector = message.createMessageComponentCollector({
            componentType: 2,
            time: this.timeout
        });

        collector.on('collect', async (i) => {
            if (i.user.id === this.interaction.user.id) {
                switch (i.customId) {
                    case 'next':
                        this.nextPage();
                        break;
                    case 'previous':
                        this.previousPage();
                        break;
                }

                await i.update({
                    embeds: [this.pages[this.currentPage].getEmbed()],
                    ephemeral: this.ephemeral,
                    components: [this.createButtons()]
                });
            } else {
                i.reply({ content: 'You cannot control these buttons.', ephemeral: true });
            }
        });

        collector.on('end', () => {
            message.edit({ components: [] });
        });
    }

    nextPage() {
        this.currentPage = (this.currentPage + 1) % this.pages.length;
    }

    previousPage() {
        this.currentPage = (this.currentPage - 1 + this.pages.length) % this.pages.length;
    }
}

module.exports = Pages;