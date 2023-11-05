const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { titles } = require("../../utils/musicUtils");
const reactHandler = require("../../utils/handleReaction");
const errorHandler = require("../../utils/handleErrors");
const deletionHandler = require("../../utils/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the current queue.")
    .setDMPermission(false),

  async execute(interaction, client) {
    ////////////// base variables //////////////
    const queue = client.player.nodes.get(interaction.guildId);
    let success = false;

    if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (queue?.tracks.size === 0) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        ////////////// original response //////////////
        const shuffleEmbed = await interaction.deferReply({
          fetchReply: true,
        });

        let embed = new EmbedBuilder()
          .setTitle(titles.shuffle)
          .setDescription(
            `Queue of **${queue.tracks.data.length} tracks** has been shuffled!`
          )
          .setColor(0x25bfc4)
          .setThumbnail(
            `https://png.pngtree.com/png-vector/20230228/ourmid/pngtree-shuffle-vector-png-image_6622846.png`
          );

        ////////////// shuffle queue //////////////
        await queue.tracks.shuffle();

        await interaction.editReply({
          embeds: [embed],
        });

        success = true;

        ////////////// shuffle interaction collector //////////////
        const collector = reactHandler.shuffleReact(interaction, shuffleEmbed);

        collector.on("collect", async (reaction, user) => {
          if (user.bot) return;

          await reaction.users.remove(user.id);

          await queue.tracks.shuffle();

          embed.setDescription(
            `Queue of **${queue.tracks.data.length} tracks** has been shuffled again!`
          );

          await interaction.editReply({
            embeds: [embed],
          });
        });
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
