const { handlePlayerError } = require("../../utils/main/handleErrors");
const { handleEventDelection } = require("../../utils/main/handleDeletion");
const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = {
  name: "playerError",
  isPlayerEvent: true,

  async execute(queue, error) {
    console.error(`${consoleTags.player} While playing an audio track: `, error);

    const channel = queue.metadata.channel;
    if (!channel) return;

    const embed = handlePlayerError();

    const msg = await channel.send({
      embeds: [embed],
    });

    handleEventDelection(msg, false);
  },
};