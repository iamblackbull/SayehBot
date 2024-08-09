const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const utils = require("../../utils/main/mainUtils");
const { handleAPIError } = require("../../utils/main/handleErrors");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");
const apod = require("nasa-apod");

const nasa = new apod.Client({
  apiKey: process.env.NASA_API_KEY,
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("space")
    .setDescription("Get NASA picture of the day"),

  async execute(interaction) {
    let success = false;

    try {
      nasa().then(async function (body) {
        const url = body.hdurl || body.url;
        const image = body.hdurl || undefined;
        const description =
          body.explanation.length > 1200
            ? body.explanation.slice(0, 1200)
            : body.explanation;

        const embed = new EmbedBuilder()
          .setTitle(`**${body.title}**`)
          .setDescription(description)
          .setURL(url)
          .setColor(utils.colors.default)
          .setImage(image)
          .setFooter({
            iconURL: utils.footers.nasa,
            text: utils.texts.nasa,
          });

        await interaction.reply({
          embeds: [embed],
        });

        success = true;
      });
    } catch (error) {
      handleAPIError(interaction);
    }

    handleNonMusicalDeletion(interaction, success, 10);
  },
};
