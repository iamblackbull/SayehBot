const eventsModel = require("../../database/eventsModel");
const channelModel = require("../../database/channelModel");
const birthdayModel = require("../../database/birthdayModel");
const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = {
  name: "birthday",

  async execute(profile, client) {
    const guild = await client.guilds.fetch(process.env.guildID);
    if (!guild) return;

    const eventsList = await eventsModel.findOne({
      guildId: guild.id,
      Birthday: true,
    });
    if (!eventsList) return;

    const birthdayProfile = await birthdayModel.findOne({
      User: profile.user,
    });
    if (!birthdayProfile) return;

    const channelsList = await channelModel.findOne({
      guildId: guild.id,
    });
    if (!channelsList) return;

    const channelId = channelsList.birthdayId;
    if (!channelId) return;

    const channel = await guild.channels.fetch(channelId);
    if (!channel) return;

    const user = birthdayProfile.User;
    const age = birthdayProfile.Age;

    const content = `🎈 🎂 Today is **<@${user}>**'s birthday! (Age **${age}**) Happy birthday! 🥳 🎉`;

    await channel.send(content);

    console.log(
      `${consoleTags.app} Today is ${user}'s birthday! (Age ${age}).`
    );
  },
};
