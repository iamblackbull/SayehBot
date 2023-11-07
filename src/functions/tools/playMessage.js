const { PermissionsBitField } = require("discord.js");
const playerDataHandler = require("../../utils/handlePlayerData");
const errorHandler = require("../../utils/handleErrors");
const queueCreator = require("../../utils/createQueue");
const embedCreator = require("../../utils/createEmbed");
const buttonCreator = require("../../utils/createButtons");
const searchHandler = require("../../utils/handleSearch");
const deletionHandler = require("../../utils/handleDeletion");
const { musicChannelID } = process.env;

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    ////////////// return checks //////////////
    if (message.author.bot) return;
    if (!message.guild) return;

    ////////////// prefix pattern //////////////
    const commandPattern =
      /^\/(p|pl|pla|play|plays|played|playing|playlist)\s+/i;
    const match = message.content.match(commandPattern);

    let prefix;
    if (!match && message.channel.id !== musicChannelID) return;
    if (!match && message.channel.id === musicChannelID) prefix = false;
    if (match) prefix = true;

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
      const query = prefix
        ? message.content.slice(match[0].length).trim()
        : message.content;

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
            }
          }
        }
      }
    }

    deletionHandler.handleMessageDelection(client, firstMsg, msg, success);
  });
};
