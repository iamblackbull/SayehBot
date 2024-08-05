const { consoleTags } = require("../../utils/main/mainUtils");

module.exports = {
  name: "error",

  async execute(error) {
    console.error(
      `${consoleTags.error} While executing twitch event listener: `,
      error
    );
  },
};
