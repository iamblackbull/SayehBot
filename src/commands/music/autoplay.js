const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { musicChannelID } = process.env;
let autoplayMode = false;
const errorHandler = require("../../functions/handlers/handleErrors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autoplay")
    .setDescription("Toggle autoplay mode of the current queue.")
    .setDMPermission(false),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    let success = false;

    if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (!queue) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        const repeatEmbed = await interaction.deferReply({
          fetchReply: true,
        });

        let embed = new EmbedBuilder()
          .setColor(0x25bfc4)
          .setTitle(`⏯ Autoplay`);

        if (!autoplayMode) {
          autoplayMode = true;
          queue.setRepeatMode(3);

          embed.setDescription(
            `Autoplay mode is **ON**.\nUse </autoplay:1142494521683361874> again or react below to turn it off.`
          );
        } else if (autoplayMode) {
          autoplayMode = false;
          queue.setRepeatMode(0);

          embed.setDescription(
            `Autoplay mode is **OFF**.\nUse </autoplay:1142494521683361874> again or react below to turn it on.`
          );
        }

        await interaction.editReply({
          embeds: [embed],
        });
        success = true;

        repeatEmbed.react(`🔄`);
        const filter = (reaction, user) => {
          [`🔄`].includes(reaction.emoji.name) &&
            user.id === interaction.user.id;
        };
        const collector = repeatEmbed.createReactionCollector(filter);
        collector.on("collect", async (reaction, user) => {
          if (user.bot) return;
          reaction.users.remove(reaction.users.cache.get(user.id));

          if (autoplayMode) {
            autoplayMode = false;
            queue.setRepeatMode(0);

            embed.setDescription(
              `Autoplay mode is **OFF**.\nUse </autoplay:1142494521683361874> again to turn it on.`
            );
          } else {
            autoplayMode = true;
            queue.setRepeatMode(3);

            embed.setDescription(
              `Autoplay mode is **ON**.\nUse </autoplay:1142494521683361874> again or react below to turn it off.`
            );
          }

          await interaction.editReply({
            embeds: [embed],
          });
          success = true;
        });
      }
    }

    const timeoutDuration = success ? 5 * 60 * 1000 : 2 * 60 * 1000;
    const timeoutLog = success
      ? `Failed to delete ${interaction.commandName} interaction.`
      : `Failed to delete unsuccessfull ${interaction.commandName} interaction.`;
    setTimeout(() => {
      if (success && interaction.channel.id === musicChannelID) {
        repeatEmbed.reactions.removeAll().catch((e) => {
          return;
        });
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timeoutDuration);
  },
};
