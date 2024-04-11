const { EmbedBuilder } = require('discord.js');

class buildEmbed {
    constructor(title, options = {}) {
        this.embed = new EmbedBuilder();

        if (options.currentPage !== undefined && options.totalPages !== undefined) {
            this.embed.setTitle(`${title} (${options.currentPage} of ${options.totalPages})`);
        } else {
            this.embed.setTitle(title);
        }

        if (options.color) {
            this.embed.setColor(options.color);
        }

        if (options.description) {
            if (Array.isArray(options.description)) {
                this.embed.setDescription(options.description.join('\n'));
            } else {
                this.embed.setDescription(options.description);
            }
        }

        if (options.fields) {
            this.embed.addFields(...options.fields);
        }

        if (options.footer) {
            this.embed.setFooter(options.footer);
        }

        if (options.image) {
            this.embed.setImage(options.image);
        }

        if (options.thumbnail) {
            this.embed.setThumbnail(options.thumbnail);
        }

    }

    getEmbed() {
        return this.embed;
    }
}


module.exports = buildEmbed;
