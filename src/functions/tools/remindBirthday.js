const { birthdayChannelID, guildID } = process.env;
const birthdayModel = require("../../database/birthdayModel");
const checkBirthday = require("../../database/checkBirthdayModel");
const eventsModel = require("../../database/eventsModel");
const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = (client) => {
  client.remindBirthday = async () => {
    const guild = await client.guilds.fetch(guildID);
    const channel = await guild.channels.fetch(birthdayChannelID);
    if (!guild || !channel) return;

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

        const birthdayProfile = await birthdayModel.findOne({
          Birthday: reminder,
        });

        if (!birthdayProfile) return;
        else {
          const user = birthdayProfile.User;
          const age = parseInt(birthdayProfile.Age) + 1;

          await birthdayModel.updateOne({ User: user }, { Age: `${age}` });

          const eventsList = await eventsModel.findOne({
            guildId: guild.id,
            Birthday: true,
          });
          if (!eventsList) return;

          let content;
          if (user === "481094367407374348") {
            content = `🎈 🎂 👑 Today is **Our Queen**'s birthday! Happy birthday **<@${birthdayProfile.User}>**! (Age **${age}**) 👑 🥳 🎉`;
          } else {
            content = `🎈 🎂 Today is **<@${birthdayProfile.User}>**'s birthday! (Age **${age}**) Happy birthday! 🥳 🎉`;
          }

          await channel
            .send({
              content: content,
            })
            .catch(console.error);

          console.log(
            `${consoleTags.app} Today is ${birthdayProfile.User}'s birthday! (Age ${age}).`
          );
        }
      }
    }
  };
};
