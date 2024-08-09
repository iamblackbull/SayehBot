const eventsModel = require("../../database/eventsModel");
const levelModel = require("../../database/levelModel");
const channelModel = require("../../database/channelModel");
const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = {
  name: "levelUp",

  async execute(user, client) {
    const eventsList = await eventsModel.findOne({
      guildId: user.guildId,
      Level: true,
    });
    if (!eventsList) return;

    const levelProfile = await levelModel.findOne({
      guildId: user.guildId,
      userId: user.userId,
    });
    if (!levelProfile) return;

    console.log(
      `${consoleTags.app} ${levelProfile.username} just advanced to Level ${levelProfile.level}.`
    );

    const guild = await client.guilds.fetch(levelProfile.guildId);
    if (!guild) return;

    const channelsList = await channelModel.findOne({
      guildId: levelProfile.guildId,
    });
    if (!channelsList) return;

    const channelId = channelsList.levelId;
    if (!channelId) return;

    const channel = await guild.channels.fetch(channelId);

    setTimeout(async () => {
      channel.send(
        `🎊 <@${levelProfile.userId}> just advanced to Level **${levelProfile.level}** 🙌`
      );
    }, 3_000);
  },
};
