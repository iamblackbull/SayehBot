const { SlashCommandBuilder } = require("discord.js");
const embedCreator = require("../../utils/player/createMusicEmbed");
const reactHandler = require("../../utils/main/handleReaction");
const errorHandler = require("../../utils/main/handleErrors");
const deletionHandler = require("../../utils/main/handleDeletion");

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

        const reminder =
          "Use </shuffle:1047903145218547863> again or react below to reshuffle.";

        let description = `Queue of **${queue.tracks.data.length} tracks** has been shuffled!\n${reminder}`;

        let embed = embedCreator.createShuffleEmbed(description);

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

          description = `Queue of **${queue.tracks.data.length} tracks** has been reshuffled!\n${reminder}`;

          embed = embedCreator.createShuffleEmbed(description);

          await interaction.editReply({
            embeds: [embed],
          });
        });
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
