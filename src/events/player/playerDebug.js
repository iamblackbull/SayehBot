const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = {
  name: "debug",
  isPlayerEvent: true,

  async execute(message) {
    //console.error(`${consoleTags.player} Debug event: `, message);
  },
};
