const chalk = require("chalk");

module.exports = {
  name: "err",
  execute() {
    console.log(
      chalk.yellow(`An error occured with the Database connection :\n${err}`)
    );
  },
};
