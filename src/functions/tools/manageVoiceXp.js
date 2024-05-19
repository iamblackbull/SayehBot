const { Events } = require("discord.js");
const { DBTOKEN } = process.env;
const { calculateXP } = require("../../utils/level/handleXPRate");
const { handleVoiceXp } = require("../../utils/level/handleLevel");
const Levels = require("discord-xp");

Levels.setURL(DBTOKEN);

const voiceChannelEntryTimestamps = new Map();

module.exports = (client) => {
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if (newState.member.user.bot) return;

    const userId = newState.member.id;
    const user = await Levels.fetch(userId, newState.guild.id);

    if (newState.channelId && newState.channelId !== oldState.channelId) {
      voiceChannelEntryTimestamps.set(userId, Date.now());
    } else if (
      !newState.channelId &&
      newState.channelId !== oldState.channelId
    ) {
      const entryTimestamp = voiceChannelEntryTimestamps.get(userId);

      if (entryTimestamp) {
        const amount = Math.floor(
          (Date.now() - entryTimestamp) / (10 * 60 * 1000)
        );

        voiceChannelEntryTimestamps.delete(userId);

        if (amount <= 0) return;

        const { finalXp } = calculateXP(newState, user);
        const xpEarned = amount * finalXp;

        await handleVoiceXp(newState, xpEarned);
      }
    }
  });
};
