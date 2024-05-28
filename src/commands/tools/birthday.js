const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const birthdayModel = require("../../database/birthdayModel");
const utils = require("../../utils/main/mainUtils");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("birthday")
    .setDescription("Add a birthday date")
    .addIntegerOption((options) =>
      options
        .setName("day")
        .setMinValue(1)
        .setMaxValue(31)
        .setDescription("Day of birthday")
        .setRequired(true)
    )
    .addIntegerOption((optins) =>
      optins
        .setName("month")
        .setMinValue(1)
        .setMaxValue(12)
        .setDescription("Month of birthday")
        .setRequired(true)
    )
    .addIntegerOption((optins) =>
      optins
        .setName("year")
        .setMinValue(1922)
        .setMaxValue(2022)
        .setDescription("Year of birthday")
        .setRequired(true)
    ),

  async execute(interaction) {
    let success = false;
    let validDate = true;

    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;
    const currentDate = date.getDate();

    const day = interaction.options.getInteger("day");
    const month = interaction.options.getInteger("month");
    const year = interaction.options.getInteger("year");
    const age = currentYear - interaction.options.getInteger("year");

    if (month == 2 && day > 28) {
      validDate = false;
    } else if (
      (month == 4 || month == 6 || month == 9 || month == 11) &&
      day > 30
    ) {
      validDate = false;
    } else if (year == currentYear) {
      if (month > currentMonth) {
        validDate = false;
      } else if (month == currentMonth && day > currentDate) {
        validDate = false;
      }
    }

    if (!validDate) {
      errorHandler.handleInvalidDate(interaction);
    } else if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else {
      const birthdayProfile = await birthdayModel.findOneAndUpdate(
        {
          User: interaction.user.id,
        },
        {
          Birthday: `${day} / ${month}`,
          Day: `${day}`,
          Month: `${month}`,
          Year: `${year}`,
          Age: `${age}`,
        },
        { upsert: true }
      );

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.birthday)
        .setDescription(
          `**${birthdayProfile.Day} / ${birthdayProfile.Month} / ${birthdayProfile.Year}** (Age **${birthdayProfile.Age}**)\n has been saved in the database.`
        )
        .setColor(utils.colors.default)
        .setThumbnail(utils.thumbnails.birthday)
        .setFooter({
          text: utils.texts.tools,
          iconURL: utils.footers.tools,
        });

      console.log(
        `${utils.consoleTags.app} ${interaction.user.username} saved a birthday date in database.`
      );

      await interaction.reply({
        embeds: [embed],
      });

      success = true;
    }

    handleNonMusicalDeletion(interaction, success, undefined, 10);
  },
};
