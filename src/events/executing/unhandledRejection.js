const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = {
  name: "unhandledRejection",

  execute(reason) {
    console.error(
      `${consoleTags.error} Unhandled Rejection with reason: `,
      reason
    );
  },
};
