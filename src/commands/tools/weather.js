const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const utils = require("../../utils/main/mainUtils");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");
const errorHandler = require("../../utils/main/handleErrors");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription(`${utils.tags.updated} Get info about weather conditions`)
    .addStringOption((option) =>
      option
        .setName("location")
        .setDescription("Input a location name")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("unit")
        .setDescription("Select a degree unit (default: °C)")
        .addChoices(
          {
            name: "°C",
            value: "m",
          },
          {
            name: "°F",
            value: "f",
          },
          {
            name: "°K",
            value: "s",
          }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;
    const city = interaction.options.getString("location");
    const unit = interaction.options.getString("unit") || "m";
    const apiKey = process.env.WEATHER_API_KEY;

    const url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${city}&units=${unit}`;

    const response = await axios.get(url).catch(async (error) => {
      console.error(
        `${utils.consoleTags.error} While fetching Weather data: `,
        error
      );

      await errorHandler.handleAPIError(interaction);
    });

    const result = response.data;
    const { location, current } = result;

    if (!location) await errorHandler.handleNoResultError(interaction);
    else {
      const embed = new EmbedBuilder()
        .setTitle(`**${location.name}, ${location.country}**`)
        .setThumbnail(current.weather_icons[0])
        .setColor(utils.colors.default)
        .setDescription(
          `# ${current.temperature}° ${current.weather_descriptions[0]}`
        )
        .addFields(
          {
            name: "Feels Like",
            value: `${current.feelslike}°`,
            inline: true,
          },
          {
            name: "Wind Speed (Dir)",
            value: `${current.wind_speed} mph (${current.wind_dir})`,
            inline: true,
          },
          {
            name: "Humidity",
            value: `${current.humidity}%`,
            inline: true,
          },
          {
            name: "Visibility",
            value: `${current.visibility} mi`,
            inline: true,
          },
          {
            name: "Pressure",
            value: `${current.pressure} hPa`,
            inline: true,
          },
          {
            name: "UV Index",
            value: `${current.uv_index}`,
            inline: true,
          }
        )
        .setFooter({
          text: location.localtime,
          iconURL: utils.footers.date,
        });

      const colorArray = [
        {
          name: "sunny",
          color: utils.colors.sunny_weather,
        },
        {
          name: "clear",
          color: utils.colors.clear_weather,
        },
        {
          name: "rain",
          color: utils.colors.rain_weather,
        },
        {
          name: "wind",
          color: utils.colors.wind_weather,
        },
        {
          name: "storm",
          color: utils.colors.storm_weather,
        },
        {
          name: "cloud",
          color: utils.colors.cloud_weather,
        },
        {
          name: "snow",
          color: utils.colors.snow_weather,
        },
      ];

      colorArray.forEach((condition) => {
        if (
          current.weather_descriptions[0].toLowerCase().includes(condition.name)
        )
          embed.setColor(condition.color);
      });

      await interaction.editReply({
        embeds: [embed],
      });

      success = true;
    }

    handleNonMusicalDeletion(interaction, success, undefined, 10);
  },
};
