const { EmbedBuilder, ComponentType } = require("discord.js");
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const utils = require("../main/mainUtils");
const wow = require("../../schemas/wow-schema");
const ow = require("../../schemas/owProfile");

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
        let profile = false;

        if (messageComponentInteraction.customId === "wow") {
          const character = options.getString("character");
          const realm = options.getString("realm");
          const region = options.getString("region");

          profile = await wow.findOneAndUpdate(
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

          profile = ow.findOneAndUpdate(
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

        let action;
        if (profile && profile._id) action = "saved";
        else if (profile != null) action = "edited";
        else action = "failed to save";

        if (action === "failed to save") {
          errorHandler.handleUnknownError(messageComponentInteraction);
        } else {
          const bookmarkEmbed = new EmbedBuilder()
            .setTitle(utils.titles.bookmark)
            .setDescription(`Your profile has been ${action} in the database.`)
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
        }

        console.log(
          `${messageComponentInteraction.user.userrname} just ${action} their profile in the database.`
        );
      }
    })
    .catch((error) => {
      console.log(
        "Bookmark collector did not receive any interactions before ending."
      );
    });
}
