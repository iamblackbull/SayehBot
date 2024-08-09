const { mongoose } = require("mongoose");
const streamModel = require("../../database/streamModel");
const streamHandler = require("../../utils/api/handleStream");
const { updateStream } = require("../../utils/main/handleNotifications");

module.exports = (client) => {
  client.updateStream = async () => {
    if (mongoose.connection.readyState !== 1) return;

    const streamList = await streamModel.findOne({
      IsLive: true,
    });
    if (!streamList) return;

    const { result } = await streamHandler.getStreamData(streamList.Streamer);

    if (result === undefined || result.type !== "live") return;

    await updateStream(client, result);
  };
};
