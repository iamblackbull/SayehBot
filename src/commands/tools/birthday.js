const { mongoose } = require("mongoose");
const birthday = require("../../schemas/birthday-schema");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

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
    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;
    const currentDate = date.getDate();
    let day = interaction.options.getInteger("day");
    let month = interaction.options.getInteger("month");
    let year = interaction.options.getInteger("year");
    let age = currentYear - interaction.options.getInteger("year");

    day = parseInt(day);
    month = parseInt(month);
    year = parseInt(year);

    let failedEmbed = new EmbedBuilder().setColor(0xffea00);

    if (month == 2) {
      if (day > 28) {
        failedEmbed
          .setTitle(`**Invalid Date**`)
          .setDescription(`Please specify a valid date.`)
          .setThumbnail(`https://img.icons8.com/color/512/calendar--v1.png`);
        interaction.reply({
          embeds: [failedEmbed],
        });
      }
    } else if (month == 4 || month == 6 || month == 9 || month == 11) {
      if (day > 30) {
        failedEmbed
          .setTitle(`**Invalid Date**`)
          .setDescription(`Please specify a valid date.`)
          .setThumbnail(`https://img.icons8.com/color/512/calendar--v1.png`);
        interaction.reply({
          embeds: [failedEmbed],
        });
      }
    } else if (year == currentYear) {
      if (month > currentMonth) {
        failedEmbed
          .setTitle(`**Invalid Date**`)
          .setDescription(`Please specify a valid date.`)
          .setThumbnail(`https://img.icons8.com/color/512/calendar--v1.png`);
        interaction.reply({
          embeds: [failedEmbed],
        });
      } else if (month == currentMonth) {
        if (day > currentDate) {
          failedEmbed
            .setTitle(`**Invalid Date**`)
            .setDescription(`Please specify a valid date.`)
            .setThumbnail(`https://img.icons8.com/color/512/calendar--v1.png`);
          interaction.reply({
            embeds: [failedEmbed],
          });
        }
      }
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

          embed
            .setTitle(`Save Birthday`)
            .setDescription(
              `**${birthdayProfile.Day} / ${birthdayProfile.Month} / ${birthdayProfile.Year}** (Age **${birthdayProfile.Age}**)\n has been added to the database.`
            )
            .setColor(0x25bfc4)
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/4525/4525667.png`
            );

          await birthdayProfile.save().catch(console.error);
          await interaction.reply({
            embeds: [embed],
          });
          console.log(
            `${interaction.user.username} saved a birthday date to database!`
          );
        } else {
          birthdayProfile = await birthday.findOneAndDelete({
            User: interaction.user.id,
          });
          const newBirthdayProfile = new birthday({
            User: interaction.user.id,
            Birthday: `${day} / ${month}`,
            Day: `${day}`,
            Month: `${month}`,
            Year: `${year}`,
            Age: `${age}`,
          });

          embed
            .setTitle(`Edit Birthday`)
            .setDescription(
              `**${newBirthdayProfile.Day} / ${newBirthdayProfile.Month} / ${newBirthdayProfile.Year}** (Age **${newBirthdayProfile.Age}**)\n has been saved to the database.`
            )
            .setColor(0x25bfc4)
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/4525/4525667.png`
            );

          await newBirthdayProfile.save().catch(console.error);
          await interaction.reply({
            embeds: [embed],
          });
          console.log(
            `${interaction.user.username} edited a birthday date in database!`
          );
        }
      }
    }
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete Birthday interaction.`);
      });
    }, 10 * 60 * 1000);
  },
};
