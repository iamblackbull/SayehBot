const { GiveawaysManager } = require("discord-giveaways");
const giveaway = require("../../schemas/giveaway-schema");

module.exports = (client) => {
  const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
    async getAllGiveaways() {
      return await giveaway.find().lean().exec();
    }

    async saveGiveaway(messageId, giveawayData) {
      await giveaway.create(giveawayData);
      return true;
    }

    async editGiveaway(messageId, giveawayData) {
      await giveaway.updateOne({ messageId }, giveawayData).exec();
      return true;
    }

    async deleteGiveaway(messageId) {
      await giveaway.deleteOne({ messageId }).exec();
      return true;
    }
  };

  const manager = new GiveawayManagerWithOwnDatabase(client, {
    default: {
      botsCanWin: false,
      embedColor: "#c42577",
      embedColorEnd: "#ff0000",
      reaction: "🎉",
    },
  });
  client.giveawaysManager = manager;
};
