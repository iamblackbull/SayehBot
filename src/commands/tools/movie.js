const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const movier = require("movier");
const { movieChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("movie")
    .setDescription("Returns Information about movies in IMDb")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Input the movie name you are looking for")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let success;

    const name = interaction.options.getString("name");
    await movier
      .getTitleDetailsByName(`${name}`)
      .then(async function (result) {
        const embed = new EmbedBuilder()
          .setTitle(`${result.name} ${result.titleYear} (${result.mainType})`)
          .setURL(`${result.mainSource.sourceUrl}`)
          .setDescription(result.plot)
          .setThumbnail(result.posterImage.url)
          .setColor(0xccbd1b)
          .addFields(
            {
              name: `Rate`,
              value: `${result.mainRate.rate} / 10` || `--`,
              inline: true,
            },
            {
              name: `Main Genre`,
              value: `${result.genres[0]}` || `--`,
              inline: true,
            },
            {
              name: `Main Director`,
              value: `${result.directors[0].name}` || `--`,
              inline: true,
            },
            {
              name: `Main Writer`,
              value: `${result.writers[0].name}` || `--`,
              inline: true,
            },
            {
              name: `Main Country`,
              value: `${result.countriesOfOrigin[0]}` || `--`,
              inline: true,
            },
            {
              name: `Duration`,
              value: `${result.runtime.title}`,
              inline: true,
            }
          )
          .setFooter({
            iconURL: `https://download.logo.wine/logo/IMDb/IMDb-Logo.wine.png`,
            text: `IMDb`,
          });

        await interaction.editReply({
          embeds: [embed],
        });
        success = true;
      })
      .catch(async (e) => {
        const failedEmbed = new EmbedBuilder()
          .setTitle(`**No Result**`)
          .setDescription(`Make sure you input a valid movie name.`)
          .setColor(0xffea00)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
          );
        interaction.editReply({
          embeds: [failedEmbed],
        });
        success = false;
      });
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === movieChannelID) return;
        else {
          interaction.deleteReply().catch((e) => {
            console.log(`Failed to delete Movie interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Movie interaction.`);
        });
      }
    }, 10 * 60 * 1000);
  },
};
