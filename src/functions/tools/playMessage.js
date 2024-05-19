const { PermissionsBitField } = require("discord.js");
const playerDataHandler = require("../../utils/player/handlePlayerData");
const queueCreator = require("../../utils/player/createQueue");
const embedCreator = require("../../utils/player/createMusicEmbed");
const searchHandler = require("../../utils/player/handleSearch");
const errorHandler = require("../../utils/main/handleErrors");
const buttonCreator = require("../../utils/main/createButtons");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    ////////////// return checks //////////////
    if (message.author.bot) return;
    if (message.webhookId) return;
    if (!message.guild) return;

    ////////////// prefix pattern //////////////
    const commandPattern =
      /^\/(p|pl|pla|play|plays|played|playing|playlist)\s+/i;

    const match = message.content.match(commandPattern);
    if (!match) return;

    const firstMsg = message;
    let success = false;
    let msg;

    if (
      !message.guild.members.me.permissions.has(PermissionsBitField.Flags.Speak)
    ) {
      msg = await errorHandler.handlePermissionErrorMessage(message);
    } else if (!message.member.voice.channel) {
      msg = await errorHandler.handleVoiceChannelErrorMessage(message);
    } else {
      const query = message.content.slice(match[0].length).trim();

      const result = await searchHandler.search(query);

      if (!result.hasTracks()) {
        msg = await errorHandler.handleNoResultErrorMessage(message);
      } else {
        const queue =
          client.player.nodes.get(message.guild.id) ||
          (await queueCreator.createMessageQueue(client, message, result));

        if (!queue.connection) {
          await queue.connect(message.member.voice.channel);
        }

        const sameChannel =
          queue.connection.joinConfig.channelId ===
          message.member.voice.channel.id;

        if (!sameChannel) {
          msg = await errorHandler.handleBusyErrorMessage(message);
        } else {
          ////////////// play track //////////////
          try {
            const song = result.tracks[0];

            const target = result.playlist ? result.tracks : song;
            await queue.addTrack(target);

            const { embed, nowPlaying } = embedCreator.createTrackEmbed(
              false,
              queue,
              result,
              song
            );

            await playerDataHandler.handleMessageData(message, nowPlaying);

            if (!queue.node.isPlaying() && !queue.node.isPaused())
              await queue.node.play();

            const button = buttonCreator.createButtons(nowPlaying);

            msg = await message.reply({
              embeds: [embed],
              components: [button],
            });

            success = true;
          } catch (error) {
            if (
              error.message.includes("Sign in to confirm your age.") ||
              error.message.includes("The following content may contain")
            ) {
              msg = await errorHandler.handleRestriceErrorMessage(message);
            } else if (
              error.message ===
                "Cannot read properties of null (reading 'createStream')" ||
              error.message.includes(
                "Failed to fetch resources for ytdl streaming"
              ) ||
              error.message.includes("Could not extract stream for this track")
            ) {
              msg = await errorHandler.handleThirdPartyErrorMessage(message);
            } else {
              msg = await errorHandler.handleUnknownErrorMessage(message);

              console.log(error);
            }
          }
        }
      }
    }

    deletionHandler.handleMessageDelection(client, firstMsg, msg, success);
  });
};
