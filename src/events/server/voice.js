const { Events } = require("discord.js");
const { getUser } = require("../../utils/level/handleLevel");
const { calculateXP } = require("../../utils/level/handleXPRate");
const { handleVoiceXp } = require("../../utils/level/handleLevel");
const { consoleTags } = require("../../utils/main/mainUtils");

const voiceChannelEntryIntervals = new Map();

module.exports = {
  name: Events.VoiceStateUpdate,

  async execute(oldState, newState) {
    if (newState.member.user.bot) return;

    const { member, guild } = newState;

    if (!oldState.channelId && newState.channelId) {
      if (voiceChannelEntryIntervals.get(member.user.id)) return;

      const intervalId = setInterval(async () => {
        const levelProfile = await getUser(guild.id, member.user);
        const XP = await calculateXP(newState, levelProfile);

        await handleVoiceXp(newState, XP);
      }, 1_200_000);

      voiceChannelEntryIntervals.set(member.user.id, intervalId);

      console.log(
        `${consoleTags.app} ${member.user.username} joined a voice channel.`
      );
    } else if (oldState.channelId && !newState.channelId) {
      console.log(
        `${consoleTags.app} ${member.user.username} left a voice channel.`
      );

      const intervalId = voiceChannelEntryIntervals.get(member.user.id);

      if (!intervalId) return;

      clearInterval(intervalId);
      voiceChannelEntryIntervals.delete(member.user.id);
    }
  },
};
