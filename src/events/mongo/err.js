module.exports = {
  name: "err",

  execute(error) {
    console.error("[Database Status] Connection failed: ", error);
  },
};
