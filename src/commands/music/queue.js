const { SlashCommandBuilder } = require("discord.js");
const embedCreator = require("../../utils/player/createMusicEmbed");
const reactHandler = require("../../utils/main/handleReaction");
const errorHandler = require("../../utils/main/handleErrors");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Get info about the current queue.")
    .addNumberOption((option) =>
      option
        .setName("page")
        .setDescription(
          "Input a page number to see a specific page from the queue."
        )
        .setMinValue(1)
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    ////////////// base variables //////////////
    const queue = client.player.nodes.get(interaction.guildId);
    let success = false;

    if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (!queue || !queue.currentTrack) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        ////////////// original response //////////////
        const queueEmbed = await interaction.deferReply({
          fetchReply: true,
        });

        let totalPages = Math.ceil(queue.tracks.data.length / 10) || 1;
        let page = (interaction.options.getNumber("page") || 1) - 1;

        if (interaction.options.getNumber("page") > totalPages) {
          page = totalPages - 1;
        }

        const embed = embedCreator.createQueueEmbed(page, totalPages, queue);

        await interaction.editReply({
          embeds: [embed],
        });

        success = true;

        ////////////// page switching collector //////////////
        const collector = reactHandler.queueReact(interaction, queueEmbed);

        collector.on("collect", async (reaction, user) => {
          if (user.bot) return;

          await reaction.users.remove(user.id);

          if (!queue || !queue.currentTrack) return;

          if (reaction.emoji.name == "➡" && page < totalPages - 1) {
            page++;
          } else if (reaction.emoji.name == "⬅" && page !== 0) {
            --page;
          } else if (reaction.emoji.name == "🔀" && queue?.tracks.size !== 0) {
            await queue.tracks.shuffle();
          } else if (reaction.emoji.name == "🔁") {
            const toggleNumber =
              queue.repeatMode == 3 ? 0 : queue.repeatMode + 1;

            await queue.setRepeatMode(toggleNumber);
          } else return;

          totalPages = Math.ceil(queue.tracks.data.length / 10) || 1;

          const updatedEmbed = embedCreator.createQueueEmbed(
            page,
            totalPages,
            queue
          );

          interaction.editReply({
            embeds: [updatedEmbed],
          });
        });
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
