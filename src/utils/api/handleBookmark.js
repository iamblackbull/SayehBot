const { EmbedBuilder, ComponentType } = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const utils = require("../main/mainUtils");
const wowModel = require("../../database/wowModel");
const owModel = require("../../database/overwatchModel");
const { consoleTags } = require("../../utils/main/mainUtils");

async function bookmark(interaction, reply) {
  const { options } = interaction;

  reply
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 10 * 60 * 1000,
    })
    .then(async (messageComponentInteraction) => {
      if (mongoose.connection.readyState !== 1) {
        errorHandler.handleDatabaseError(messageComponentInteraction);
      } else {
        const { customId, user } = messageComponentInteraction;

        if (customId === "wow") {
          const character = options.getString("character");
          const realm = options.getString("realm");
          const region = options.getString("region");

          await wowModel.findOneAndUpdate(
            {
              User: user.id,
            },
            {
              WowCharacter: character,
              WowRealm: realm,
              WowRegion: region,
            },
            {
              upsert: true,
              new: true,
            }
          );
        } else if (customId === "ow") {
          const username = options.getString("username");
          const tag = `${username}}-${options.getInteger("tag")}`;

          await owModel.findOneAndUpdate(
            {
              User: user.id,
            },
            {
              Tag: tag,
            },
            {
              upsert: true,
              new: true,
            }
          );
        }

        const bookmarkEmbed = new EmbedBuilder()
          .setTitle(utils.titles.bookmark)
          .setDescription("Your profile has been saved in the database.")
          .setColor(utils.colors.default)
          .setThumbnail(utils.thumbnails.bookmark)
          .setFooter({
            iconURL: utils.footers.tools,
            text: utils.texts.tools,
          });

        await messageComponentInteraction.reply({
          embeds: [bookmarkEmbed],
          ephemeral: true,
        });

        console.log(
          `${consoleTags.app} ${user.userrname} just saved their game profile in the database.`
        );
      }
    })
    .catch((error) => {
      console.error(
        `${consoleTags.warning} Bookmark collector did not receive any interactions before ending.`
      );
    });
}

module.exports = {
  bookmark,
};
