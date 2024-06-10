const { Events } = require("discord.js");
const { calculateXP } = require("../../utils/level/handleXPRate");
const { handleVoiceXp } = require("../../utils/level/handleLevel");
const { consoleTags } = require("../../utils/main/mainUtils");
const Levels = require("discord-xp");

Levels.setURL(process.env.DBTOKEN);
const voiceChannelEntryTimestamps = new Map();

module.exports = {
  name: Events.VoiceStateUpdate,

  async execute(oldState, newState) {
    if (newState.member.user.bot) return;

    const userId = newState.member.id;
    const user = await Levels.fetch(userId, newState.guild.id);

    if (newState.channelId && newState.channelId !== oldState.channelId) {
      voiceChannelEntryTimestamps.set(userId, Date.now());

      console.log(
        `${consoleTags.app} ${newState.member.user.username} joined a voice channel.`
      );
    } else if (
      !newState.channelId &&
      newState.channelId !== oldState.channelId
    ) {
      console.log(
        `${consoleTags.app} ${newState.member.user.username} left a voice channel.`
      );

      const entryTimestamp = voiceChannelEntryTimestamps.get(userId);

      if (!entryTimestamp) return;

      const amount = Math.floor((Date.now() - entryTimestamp) / 1_200_000);

      voiceChannelEntryTimestamps.delete(userId);

      if (amount <= 0) return;

      const { finalXp } = await calculateXP(newState, user);
      const xpEarned = amount * finalXp;

      await handleVoiceXp(newState, xpEarned);
    }
  },
};
