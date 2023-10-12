const {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { AudioFilters, useTimeline } = require("discord-player");
const { musicChannelID } = process.env;
const errorHandler = require("../../utils/handleErrors");

AudioFilters.define(
  "8D",
  "apulsator=hz=0.128",
  "bassboost_low",
  "vaporwave",
  "nightcore",
  "reverse",
  "earrape",
  "fadein",
  "karaoke",
  "vibrato",
  "normalizer"
);

const availableFilters = [
  {
    label: "8D",
    value: "8D",
    description: "Simulate surround audio effect.",
    emoji: "🎧",
  },
  {
    label: "Bass boost",
    value: "bassboost_low",
    description: "Boost the bass of the audio.",
    emoji: "🔊",
  },
  {
    label: "Nightcore",
    value: "nightcore",
    description: "Speed up the audio (higher pitch).",
    emoji: "💨",
  },
  {
    label: "Vaporwave",
    value: "vaporwave",
    description: "Slow down the audio (lower pitch).",
    emoji: "🐌",
  },
  {
    label: "Reverse",
    value: "reverse",
    description: "Reverse the audio.",
    emoji: "◀",
  },
  {
    label: "Fade-in",
    value: "fadein",
    description: "Add a progressive increase in the volume of the audio.",
    emoji: "📈",
  },
  {
    label: "Karaoke",
    value: "karaoke",
    description: "Lower the singer's voice from the audio.",
    emoji: "🎤",
  },
  {
    label: "Vibrato",
    value: "vibrato",
    description: "Make the notes change pitch subtly and quickly.",
    emoji: "📳",
  },
  {
    label: "Earrape",
    value: "earrape",
    description: "Add a extremely loud and distorted audio.",
    emoji: "👂",
  },
  {
    label: "Normalizer",
    value: "normalizer",
    description: "Normalize the audio (avoid distortion).",
    emoji: "🎼",
  },
];

let filterMenu;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Put / Remove filters of the current queue.")
    .setDMPermission(false),

  async execute(interaction, client) {
    let success = false;
    let timer;

    const queue = client.player.nodes.get(interaction.guildId);

    if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (!queue || !queue.node.isPlaying()) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        let embed = new EmbedBuilder()
          .setColor(0xc42577)
          .setTitle("✨ Current Filter")
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/1457/1457956.png`
          );

        let filtersOptions = [];
        availableFilters.forEach((filter) => {
          let isEnabled = false;

          if (queue.filters.ffmpeg.filters.includes(filter.value)) {
            isEnabled = true;
          }

          filtersOptions.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(filter.label)
              .setDescription(filter.description)
              .setValue(filter.value)
              .setEmoji(filter.emoji)
              .setDefault(isEnabled)
          );
        });

        if (queue.filters.ffmpeg.filters.length > 0) {
          embed.setDescription(
            `**${queue.filters.ffmpeg.filters.length}** filters are enabled.`
          );
        } else {
          embed.setDescription(`Filters are disabled.`);
        }

        filterMenu = new StringSelectMenuBuilder()
          .setCustomId(`filters`)
          .setPlaceholder("Select which filters to apply")
          .setMinValues(0)
          .setMaxValues(filtersOptions.length)
          .addOptions(filtersOptions);

        let button = new ActionRowBuilder().addComponents(filterMenu);

        const filterEmbed = await interaction.reply({
          embeds: [embed],
          components: [button],
        });
        success = true;

        const { timestamp } = useTimeline(interaction.guildId);
        const duration = timestamp.total.label;
        const convertor = duration.split(":");
        const totalTimer = +convertor[0] * 60 + +convertor[1];

        const currentDuration = timestamp.current.label;
        const currentConvertor = currentDuration.split(":");
        const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

        timer = totalTimer - currentTimer;

        if (timer > 10 * 60) timer = 10 * 60;
        if (timer < 1 * 60) timer = 1 * 60;

        try {
          const collector = await filterEmbed.createMessageComponentCollector({
            filter: (input) => input.user.id === interaction.user.id,
            time: timer * 1000,
          });

          collector.on("collect", async (input) => {
            input.deferUpdate();

            if (queue.filters.ffmpeg.filters.length > 0) {
              queue.filters.ffmpeg.setFilters(false);
            }
            if (input.values.length === 0) {
              embed.setDescription("Filters are disabled.");
            } else {
              if (
                input.values.includes("bassboost_low") &&
                !input.values.includes("normalizer")
              ) {
                input.values.push("normalizer");
              }

              queue.filters.ffmpeg.toggle(input.values);

              embed.setDescription(`**${
                queue.filters.ffmpeg.filters.length
              }** filters are enabled.\n
              ${input.values
                .map((enabledFilter) => {
                  let filter = availableFilters.find(
                    (filter) => enabledFilter == filter.value
                  );

                  return `- **${filter.emoji} ${filter.label}**`;
                })
                .join("\n")}`);
            }

            filterMenu.setOptions();

            filtersOptions = [];
            availableFilters.forEach((filter) => {
              let isEnabled = false;

              if (queue.filters.ffmpeg.filters.includes(filter.value)) {
                isEnabled = true;
              }

              filtersOptions.push(
                new StringSelectMenuOptionBuilder()
                  .setLabel(filter.label)
                  .setDescription(filter.description)
                  .setValue(filter.value)
                  .setEmoji(filter.emoji)
                  .setDefault(isEnabled)
              );
            });

            filterMenu.addOptions(filtersOptions);

            button = new ActionRowBuilder().addComponents(filterMenu);

            await interaction.editReply({
              embeds: [embed],
              components: [button],
            });
          });
        } catch (error) {
          if (error.code === "InteractionCollectorError") {
            console.log(
              `Interaction response timed out for command ${interaction.commandName}.`
            );
          } else {
            console.log(
              `Something went wrong while awaiting interaction response for command ${interaction.commandName}.`
            );
          }
        }
      }
    }

    const timeoutDuration = success ? timer * 1000 : 2 * 60 * 1000;
    const timeoutLog = success
      ? `Failed to delete ${interaction.commandName} interaction.`
      : `Failed to delete unsuccessfull ${interaction.commandName} interaction.`;
    setTimeout(() => {
      if (success && interaction.channel.id === musicChannelID) {
        interaction.editReply({
          components: [],
        });
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timeoutDuration);
  },
};
