const { EmbedBuilder, ComponentType } = require("discord.js");
const { mongoose } = require("mongoose");
const { handleDatabaseError } = require("../../utils/main/handleErrors");
const utils = require("../main/mainUtils");
const wowModel = require("../../database/wowModel");
const owModel = require("../../database/overwatchModel");
const { consoleTags } = require("../../utils/main/mainUtils");

async function bookmark(interaction) {
  const { options, channel } = interaction;

  const collector = channel.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 600_000,
  });

  collector.on("collect", async (i) => {
    if (mongoose.connection.readyState !== 1) {
      handleDatabaseError(i);
    } else {
      if (i.customId === "wow") {
        const character = options.getString("character");
        const realm = options.getString("realm");
        const region = options.getString("region");

        await wowModel.findOneAndUpdate(
          {
            User: i.user.id,
          },
          {
            WowCharacter: character,
            WowRealm: realm,
            WowRegion: region,
          },
          {
            upsert: true,
          }
        );
      } else if (i.customId === "ow") {
        const username = options.getString("username");
        const tag = `${username}-${options.getInteger("tag")}`;

        await owModel.findOneAndUpdate(
          {
            User: i.user.id,
          },
          {
            Tag: tag,
          },
          {
            upsert: true,
          }
        );
      }

      const bookmarkEmbed = new EmbedBuilder()
        .setTitle(utils.titles.bookmark)
        .setDescription("Your profile has been saved in the database.")
        .setColor(utils.colors.default)
        .setThumbnail(utils.thumbnails.bookmark);

      await i.reply({
        embeds: [bookmarkEmbed],
        ephemeral: true,
      });

      console.log(
        `${consoleTags.app} ${i.user.username} just saved their game profile in the database.`
      );
    }
  });
}

module.exports = {
  bookmark,
};
