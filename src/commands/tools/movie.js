const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const utils = require("../../utils/main/mainUtils");
const { handleNoResultError } = require("../../utils/main/handleErrors");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");
const movier = require("movier");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("movie")
    .setDescription("Get info about a movie in IMDb")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Input a movie name")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;
    const name = interaction.options.getString("name");

    await movier
      .getTitleDetailsByName(`${name}`)
      .then(async function (result) {
        const embed = new EmbedBuilder()
          .setTitle(
            `**${result.name} ${result.titleYear} (${result.mainType})**`
          )
          .setURL(`${result.mainSource.sourceUrl}`)
          .setDescription(result.plot)
          .setThumbnail(result.posterImage.url)
          .setColor(utils.colors.imdb)
          .addFields(
            {
              name: "Rate",
              value: `${result.mainRate.rate} / 10` || `-`,
              inline: true,
            },
            {
              name: "Main Genre",
              value: `${result.genres[0]}` || "-",
              inline: true,
            },
            {
              name: "Main Director",
              value: `${result.directors[0].name}` || "-",
              inline: true,
            },
            {
              name: "Main Writer",
              value: `${result.writers[0].name}` || "-",
              inline: true,
            },
            {
              name: "Main Country",
              value: `${result.countriesOfOrigin[0]}` || "-",
              inline: true,
            },
            {
              name: "Duration",
              value: `${result.runtime.title}`,
              inline: true,
            }
          )
          .setFooter({
            iconURL: utils.footers.imdb,
            text: utils.texts.imdb,
          });

        await interaction.editReply({
          embeds: [embed],
        });

        success = true;
      })
      .catch(async (e) => {
        await handleNoResultError(interaction);
      });

    handleNonMusicalDeletion(interaction, success, 10);
  },
};
