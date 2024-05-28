const { PermissionsBitField, Events } = require("discord.js");
const errorHandler = require("../../utils/main/handleErrors");
const { handleData } = require("../../utils/player/handlePlayerData");
const { createMessageQueue } = require("../../utils/player/createQueue");
const { createTrackEmbed } = require("../../utils/player/createMusicEmbed");
const { search } = require("../../utils/player/handleSearch");
const { createButtons } = require("../../utils/main/createButtons");
const { consoleTags } = require("../../utils/main/mainUtils");
const { handleMessageDelection } = require("../../utils/main/handleDeletion");

module.exports = {
  name: Events.MessageCreate,

  async execute(message, client) {
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

      const result = await search(query);

      if (!result.hasTracks()) {
        msg = await errorHandler.handleNoResultErrorMessage(message);
      } else {
        const queue =
          client.player.nodes.get(message.guild.id) ||
          (await createMessageQueue(client, message, result));

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

            const embedData = createTrackEmbed(false, queue, result, song);

            await handleData(message.guild.id, embedData.nowPlaying);

            if (!queue.node.isPlaying() && !queue.node.isPaused())
              await queue.node.play();

            const button = createButtons(embedData.nowPlaying);

            msg = await message.reply({
              embeds: [embedData.embed],
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

              console.error(
                `${consoleTags.error} While executing play message: `,
                error
              );
            }
          }
        }
      }
    }

    handleMessageDelection(client, firstMsg, msg, success);
  },
};
