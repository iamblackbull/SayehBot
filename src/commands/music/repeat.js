const { SlashCommandBuilder } = require("discord.js");
const embedCreator = require("../../utils/createEmbed");
const reactHandler = require("../../utils/handleReaction");
const errorHandler = require("../../utils/handleErrors");
const deletionHandler = require("../../utils/handleDeletion");

const repeatModes = ["None", "Repeat track", "Repeat queue", "Autoplay"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("repeat")
    .setDescription("Toggle repeat mode of the current queue.")
    .addStringOption((option) =>
      option
        .setName(`mode`)
        .setDescription(
          `Select a mode to repeat the current track or repeat the current queue.`
        )
        .setRequired(true)
        .addChoices(
          {
            name: "Off",
            value: "0",
          },
          {
            name: "Repeat Track",
            value: "1",
          },
          {
            name: "Repeat Queue",
            value: "2",
          },
          {
            name: "Autoplay",
            value: "3",
          }
        )
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
        const repeatEmbed = await interaction.deferReply({
          fetchReply: true,
        });

        ////////////// set repeat mode //////////////
        const mode = interaction.options.get("mode");
        const number = parseInt(mode.value, 10);
        const modeName = repeatModes[number];

        await queue.setRepeatMode(number);

        ////////////// original response //////////////
        const sentence =
          number == 0
            ? "Repeat mode is now **OFF**."
            : `${modeName} mode is now **ON**.`;

        const reminder =
          "Use </repeat:1047903145071759428> again or react below to toggle.";

        const description = `${sentence}\n${reminder}`;

        let embed = embedCreator.createRepeatEmbed(description);

        await interaction.editReply({
          embeds: [embed],
        });

        success = true;

        ////////////// toggle repeat mode collector //////////////
        const collector = reactHandler.repeatReact(interaction, repeatEmbed);

        collector.on("collect", async (reaction, user) => {
          if (user.bot) return;

          await reaction.users.remove(user.id);

          const toggleNumber =
            queue.repeatMode === 3 ? 0 : queue.repeatMode + 1;

          await queue.setRepeatMode(toggleNumber);

          const secondModeName = repeatModes[toggleNumber];

          const toggleSentence =
            toggleNumber == 0
              ? "Repeat mode is now **OFF**."
              : `${secondModeName} mode is now **ON**.`;

          const toggleDescription = `${toggleSentence}\n${reminder}`;

          embed = embedCreator.createRepeatEmbed(toggleDescription);

          await interaction.editReply({
            embeds: [embed],
          });
        });
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
