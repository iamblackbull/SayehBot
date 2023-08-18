require("dotenv").config();
const { birthdayChannelID, guildID } = process.env;
const birthday = require("../../schemas/birthday-schema");
const checkBirthday = require("../../schemas/checkBirthday-schema");

module.exports = (client) => {
  client.remindBirthday = async () => {
    const guild = await client.guilds.fetch(guildID).catch(console.error);
    const channel = await guild.channels
      .fetch(birthdayChannelID)
      .catch(console.error);

    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    const currentDate = date.getDate();
    const reminder = `${currentDate} / ${currentMonth}`;

    let checkBirthdayProfile = await checkBirthday.findOne({
      guildId: guildID,
    });
    if (!checkBirthdayProfile) {
      checkBirthdayProfile = new checkBirthday({
        guildId: guildID,
        Date: reminder,
        IsTodayChecked: false,
      });
      await checkBirthdayProfile.save().catch(console.error);
    } else {
      checkBirthdayProfile = await checkBirthday.findOne({
        guildId: guildID,
        Date: reminder,
        IsTodayChecked: true,
      });
      if (!checkBirthdayProfile) {
        checkBirthdayProfile = await checkBirthday.updateOne(
          { guildId: guildID },
          { Date: reminder, IsTodayChecked: true }
        );
        const birthdayProfile = await birthday.findOne({ Birthday: reminder });
        if (!birthdayProfile) return;
        else {
          const user = birthdayProfile.User;
          const age = parseInt(birthdayProfile.Age) + 1;

          await birthday.updateOne({ User: user }, { Age: `${age}` });

          let content;
          if (user === "481094367407374348") {
            content = `🎈 🎂 👑 Today is **Our Queen**'s birthday! Happy birthday your majesty **<@${birthdayProfile.User}>**! (Age **${age}**) 👑 🥳 🎉`;
          } else {
            content = `🎈 🎂 Today is **<@${birthdayProfile.User}>**'s birthday! (Age **${age}**) Happy birthday! 🥳 🎉`;
          }

          await channel
            .send({
              content: content,
            })
            .catch(console.error);

          console.log(
            `Today is ${birthdayProfile.User}'s birthday! (Age ${age}).`
          );
        }
      } else return;
    }
  };
};
