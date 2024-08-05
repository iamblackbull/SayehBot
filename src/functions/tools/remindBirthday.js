const birthdayModel = require("../../database/birthdayModel");
const checkBirthday = require("../../database/checkBirthdayModel");

module.exports = (client) => {
  client.remindBirthday = async () => {
    const guild = await client.guilds.fetch(process.env.guildID);
    if (!guild) return;

    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    const currentDate = date.getDate();
    const reminder = `${currentDate} / ${currentMonth}`;

    let checkBirthdayProfile = await checkBirthday.findOne({
      guildId: guild.id,
    });

    if (!checkBirthdayProfile) {
      checkBirthdayProfile = new checkBirthday({
        guildId: guild.id,
        Date: reminder,
        IsTodayChecked: false,
      });

      await checkBirthdayProfile.save().catch(console.error);
    } else {
      checkBirthdayProfile = await checkBirthday.findOne({
        guildId: guild.id,
        Date: reminder,
        IsTodayChecked: false,
      });

      if (!checkBirthdayProfile) return;

      checkBirthdayProfile = await checkBirthday.updateOne(
        { guildId: guild.id },
        { Date: reminder, IsTodayChecked: true }
      );

      const birthdayProfile = await birthdayModel.findOne({
        Birthday: reminder,
      });

      if (!birthdayProfile) return;

      const user = birthdayProfile.User;
      const age = parseInt(birthdayProfile.Age) + 1;

      await birthdayModel.updateOne({ User: user }, { Age: `${age}` });

      setTimeout(async () => {
        await client.emit("birthday", birthdayProfile);
      }, 1000);
    }
  };
};
