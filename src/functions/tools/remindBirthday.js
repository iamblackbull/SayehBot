require("dotenv").config();
const { birthdayChannelID, guildID } = process.env;
const birthday = require("../../schemas/birthday-schema");

module.exports = (client) => {
  client.remindBirthday = async () => {
    const guild = await client.guilds.fetch(guildID).catch(console.error);
    const user = client.users.cache.get(birthday.User);
    const channel = await guild.channels
      .fetch(birthdayChannelID)
      .catch(console.error);

    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;
    const currentDate = date.getDate();
    const reminder = `${currentDate} / ${currentMonth}`;

    let birthdayProfile = await birthday.findOneAndDelete({
      Birthday: reminder,
    });

    if (!birthdayProfile) return;
    else {
      const newBirthdayAge = parseInt(birthdayProfile.Age) + 1;
      newBirthdayProfile = new birthday({
        User: birthdayProfile.User,
        Birthday: `${birthdayProfile.Day} / ${birthdayProfile.Month}`,
        Day: `${birthdayProfile.Day}`,
        Month: `${birthdayProfile.Month}`,
        Year: `${birthdayProfile.Year}`,
        Age: `${newBirthdayAge}`,
      });
      await newBirthdayProfile.save().catch(console.error);
      if (guild.member(`${newBirthdayProfile.User}`)) {
        await channel
          .send({
            content: `🎈 🎂 Today is **<@${birthdayProfile.User}>**'s birthday! (Age **${newBirthdayProfile.Age}**) Happy birthday! 🥳 🎉`,
          })
          .catch(console.error);
      }
      console.log(
        `Today is ${birthdayProfile.User}'s birthday! (Age ${newBirthdayProfile.Age}) Happy birthday! `
      );
    }
  };
};
