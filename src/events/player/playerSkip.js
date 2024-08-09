const { handlePlayerSkipError } = require("../../utils/main/handleErrors");
const { handleEventDelection } = require("../../utils/main/handleDeletion");
const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = {
  name: "playerSkip",
  isPlayerEvent: true,

  async execute(queue, track) {
    console.log(
      `${consoleTags.player} Player skipped a track due to an issue.`
    );

    const channel = queue.metadata.channel;
    if (!channel) return;

    const embed = handlePlayerSkipError();

    const msg = await channel.send({
      embeds: [embed],
    });

    handleEventDelection(msg, false);
  },
};
