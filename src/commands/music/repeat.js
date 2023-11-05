const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { titles } = require("../../utils/musicUtils");
const reactHandler = require("../../utils/handleReaction");
const errorHandler = require("../../utils/handleErrors");
const deletionHandler = require("../../utils/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("repeat")
    .setDescription("Toggle repeat mode of the current queue.")
    .addStringOption((option) => {
      option
        .setName(`mode`)
        .setDescription(
          `Select a mode to repeat the current track or repeat the current queue.`
        )
        .setRequired(true)
        .addChoices(
          {
            name: "Off",
            value: 0,
          },
          {
            name: "Repeat track",
            value: 1,
          },
          {
            name: "Repeat queue",
            value: 2,
          },
          {
            name: "Autoplay",
            value: 3,
          }
        );
    })
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
        const repeatEmbed = await interaction.deferReply({
          fetchReply: true,
        });

        ////////////// set repeat mode //////////////
        const mode = interaction.options.get("mode");
        const number = mode.value;

        await queue.setRepeatMode(number);

        ////////////// original response //////////////
        const sentence =
          number == 0
            ? "Repeat mode is now **OFF**."
            : `${mode} mode is now **ON**.`;

        const description = `${sentence}\nUse </repeat:1047903145071759428> again or react below to toggle.`;

        const embed = new EmbedBuilder()
          .setDescription(description)
          .setColor(0x25bfc4)
          .setTitle(titles.repeat);

        await interaction.editReply({
          embeds: [embed],
        });

        success = true;

        if (queue.repeatMode !== 0) {
          ////////////// toggle repeat mode collector //////////////
          const collector = reactHandler.repeatReact(interaction, repeatEmbed);

          collector.on("collect", async (user) => {
            if (user.bot) return;

            await reaction.users.remove(user.id);

            const toggleNumber =
              queue.repeatMode == 3 ? 0 : queue.repeatMode + 1;

            await queue.setRepeatMode(toggleNumber);

            const repeatModes = [
              "None",
              "Repeat Track",
              "Repeat Queue",
              "Autoplay",
            ];
            const repeatMode = repeatModes[toggleNumber];

            const toggleSentence =
              toggleNumber == 0
                ? "Repeat mode is now **OFF**."
                : `${repeatMode} mode is now **ON**.`;

            const toggleDescription = `${toggleSentence}\nUse </repeat:1047903145071759428> or react again to toggle.`;

            embed.setDescription(toggleDescription);

            await interaction.editReply({
              embeds: [embed],
            });
          });
        }
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
