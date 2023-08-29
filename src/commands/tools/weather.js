const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const weather = require(`weather-js`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Get current weather data of a specific location.")
    .addStringOption((option) => {
      return option
        .setName("location")
        .setDescription("Input a location name.")
        .setRequired(false);
    }),

  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let failedEmbed = new EmbedBuilder();

    const location = interaction.options.getString("location") || "Tehran";
    weather.find({ search: `${location}`, degreeType: "C" }, function (result) {
      if (!result) {
        failedEmbed
          .setTitle(`**No Result**`)
          .setDescription(
            `There is no data for **${location}** at this moment.\nTry again later with </weather:1047903145407295507>.`
          )
          .setColor(0xffea00)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
          );

        interaction.editReply({
          embeds: [failedEmbed],
        });
      } else {
        try {
          let embed = new EmbedBuilder()
            .setTitle(`📍 ${result[0].location.name}`)
            .setThumbnail(result[0].current.imageUrl)
            .setColor(0x256fc4)
            .setDescription(
              `# ${result[0].current.temperature} ℃\n## ${result[0].current.skytext}\n### H:${result[0].forecast[0].high} L:${result[0].forecast[0].low}`
            )
            .addFields(
              {
                name: `Feels Like`,
                value: `${result[0].current.feelslike} ℃` || `--`,
                inline: true,
              },
              {
                name: `Wind`,
                value: `${result[0].current.windspeed}` || `--`,
                inline: true,
              },
              {
                name:
                  `Tomorrow (${result[0].forecast[1].shortday})` || `Tomorrow`,
                value:
                  `${result[0].forecast[1].skytextday} (H:${result[0].forecast[1].high} L:${result[0].forecast[1].low})` ||
                  `--`,
                inline: true,
              }
            )
            .setFooter({
              iconURL: `https://cdn-icons-png.flaticon.com/512/552/552448.png`,
              text: `MSN Weather `,
            });

          let color;
          switch (result[0].current.skytext.toLowerCase()) {
            case "sunny":
              color = 0xf0b81f;
              break;
            case "rainy":
              color = 0x75abe0;
              break;
            case "windy":
              color = 0x7576e0;
              break;
            case "stormy":
              color = 0x212c40;
              break;
            case "cloudy":
              color = 0xffffff;
              break;
          }

          embed.setColor(color);

          interaction.editReply({
            embeds: [embed],
          });

        } catch (err) {
          console.log(err);

          failedEmbed
            .setTitle(`**No Response**`)
            .setDescription(
              `MSN Weather API did not respond.\nTry again later with </weather:1047903145407295507>.`
            )
            .setColor(0xffea00)
            .setThumbnail(
              `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
            );

          interaction.editReply({
            embeds: [failedEmbed],
          });
        }
      }
      
      setTimeout(() => {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete ${interaction.commandName} interaction.`);
        });
      }, 10 * 60 * 1000);
    });
  },
};
