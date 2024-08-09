const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = {
  name: "uncaughtExpection",

  execute(reason) {
    console.error(
      `${consoleTags.error} Uncaugh Exception with reason: `,
      reason
    );
  },
};
