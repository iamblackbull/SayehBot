const { EmbedBuilder, ComponentType } = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const utils = require("../main/mainUtils");
const wow = require("../../database/wowModel");
const ow = require("../../database/overwatchModel");

export async function bookmark(interaction, reply) {
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
        if (messageComponentInteraction.customId === "wow") {
          const character = options.getString("character");
          const realm = options.getString("realm");
          const region = options.getString("region");

          await wow.findOneAndUpdate(
            {
              User: messageComponentInteraction.user.id,
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
        } else if (interaction.customId === "ow") {
          const username = options.getString("username");
          const tag = `${username}}-${options.getInteger("tag")}`;

          await ow.findOneAndUpdate(
            {
              User: messageComponentInteraction.user.id,
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
          `${messageComponentInteraction.user.userrname} just saved their profile in the database.`
        );
      }
    })
    .catch((error) => {
      console.log(
        "Bookmark collector did not receive any interactions before ending."
      );
    });
}
