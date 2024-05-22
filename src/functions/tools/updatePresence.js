const { mongoose } = require("mongoose");
const streamModel = require("../../database/streamModel");
const { mainPresence } = require("../../utils/main/handlePresence");

module.exports = (client) => {
  client.updatePresence = async () => {
    if (mongoose.connection.readyState !== 1) return;

    const streamList = await streamModel.findOne({
      IsLive: true,
    });

    if (streamList) return;

    await mainPresence(client);
  };
};
