const { GiveawaysManager } = require("discord-giveaways");
const giveaway = require("../../database/giveawayModel");
const { colors } = require("../../utils/main/mainUtils");

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
      embedColor: colors.giveaway,
      embedColorEnd: colors.error,
      reaction: "🎉",
    },
  });
  client.giveawaysManager = manager;
};
