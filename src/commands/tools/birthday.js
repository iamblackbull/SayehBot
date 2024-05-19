const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { mongoose } = require("mongoose");
const birthday = require("../../schemas/birthday-schema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("birthday")
    .setDescription("Add / Edit a birthday date")
    .addIntegerOption((options) => {
      return options
        .setName("day")
        .setMinValue(1)
        .setMaxValue(31)
        .setDescription("Day of birthday")
        .setRequired(true);
    })
    .addIntegerOption((optins) => {
      return optins
        .setName("month")
        .setMinValue(1)
        .setMaxValue(12)
        .setDescription("Month of birthday")
        .setRequired(true);
    })
    .addIntegerOption((optins) => {
      return optins
        .setName("year")
        .setMinValue(1922)
        .setMaxValue(2022)
        .setDescription("Year of birthday")
        .setRequired(true);
    }),

  async execute(interaction, client) {
    let validDate = true;
    let failedEmbed = new EmbedBuilder().setColor(0xffea00);

    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;
    const currentDate = date.getDate();

    let day = interaction.options.getInteger("day");
    let month = interaction.options.getInteger("month");
    let year = interaction.options.getInteger("year");
    let age = currentYear - interaction.options.getInteger("year");

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
      failedEmbed
        .setTitle(`**Invalid Date**`)
        .setDescription(
          `Please specify a valid date.\nTry again with </birthday:1047903145218547870>.`
        )
        .setThumbnail(`https://img.icons8.com/color/512/calendar--v1.png`);

      interaction.reply({
        embeds: [failedEmbed],
      });
    } else {
      if (mongoose.connection.readyState !== 1) {
        failedEmbed
          .setTitle(`**Connection Timed out!**`)
          .setDescription(
            `Connection to database has been timed out. please try again later.`
          )
          .setThumbnail(
            `https://cdn.iconscout.com/icon/premium/png-256-thumb/error-in-internet-959268.png`
          );

        interaction.reply({
          embeds: [failedEmbed],
        });
      } else {
        let embed = new EmbedBuilder();
        let mode;

        let birthdayProfile = await birthday.findOne({
          User: interaction.user.id,
        });

        if (!birthdayProfile) {
          birthdayProfile = new birthday({
            User: interaction.user.id,
            Birthday: `${day} / ${month}`,
            Day: `${day}`,
            Month: `${month}`,
            Year: `${year}`,
            Age: `${age}`,
          });
          await birthdayProfile.save().catch(console.error);

          mode = "add";
        } else {
          birthdayProfile = await birthday.updateOne(
            {
              User: interaction.user.id,
            },
            {
              Birthday: `${day} / ${month}`,
              Day: `${day}`,
              Month: `${month}`,
              Year: `${year}`,
              Age: `${age}`,
            }
          );
          mode = "edit";
        }
        embed
          .setTitle(`Save Birthday`)
          .setDescription(
            `**${birthdayProfile.Day} / ${birthdayProfile.Month} / ${birthdayProfile.Year}** (Age **${birthdayProfile.Age}**)\n has been ${mode}ed in the database.`
          )
          .setColor(0x25bfc4)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/4525/4525667.png`
          );

        await interaction.reply({
          embeds: [embed],
        });
        console.log(
          `${interaction.user.username} ${mode}ed a birthday date in database.`
        );
      }
    }
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete ${interaction.commandName} interaction.`);
      });
    }, 10 * 60 * 1000);
  },
};
