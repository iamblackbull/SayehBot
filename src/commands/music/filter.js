const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { AudioFilters, useTimeline } = require("discord-player");
const { filters } = require("../../utils/player/musicUtils");
const { createFilterEmbed } = require("../../utils/player/createMusicEmbed");
const { parseTime } = require("../../utils/main/handleDeletion");
const errorHandler = require("../../utils/main/handleErrors");
const { consoleTags } = require("../../utils/main/mainUtils");
const deletionHandler = require("../../utils/main/handleDeletion");

AudioFilters.define(
  "8D",
  "apulsator=hz=0.128",
  "normalizer",
  "bassboost_high",
  "vaporwave",
  "nightcore",
  "reverse",
  "earrape",
  "fadein",
  "karaoke",
  "vibrato"
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Toggle audio filters for the current queue")
    .setDMPermission(false),

  async execute(interaction, client) {
    ////////////// base variables //////////////
    const { guildId, member, user } = interaction;
    const queue = client.player.nodes.get(guildId);
    let success = false;

    if (!member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (!queue) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId === member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        ////////////// creating original response //////////////
        const filtersOptions = filters.map((filter) => {
          const isEnabled = queue.filters.ffmpeg.filters.includes(filter.value);

          return new StringSelectMenuOptionBuilder()
            .setLabel(filter.label)
            .setDescription(filter.description)
            .setValue(filter.value)
            .setEmoji(filter.emoji)
            .setDefault(isEnabled);
        });

        let description;

        if (queue.filters.ffmpeg.filters.length > 0) {
          description = `**${queue.filters.ffmpeg.filters.length}** filters are enabled.`;
        } else {
          description = "Filters are disabled.";
        }

        let embed = createFilterEmbed(description);

        const filterMenu = new StringSelectMenuBuilder()
          .setCustomId("filters")
          .setPlaceholder("Select which filters to apply")
          .setMinValues(0)
          .setMaxValues(filtersOptions.length)
          .addOptions(filtersOptions);

        const button = new ActionRowBuilder().addComponents(filterMenu);

        ////////////// handling menu interaction //////////////
        const { timestamp } = useTimeline(guildId);

        const totalDuration = parseTime(timestamp.total.label);
        const currentDuration = parseTime(timestamp.current.label);

        let timer = totalDuration - currentDuration;

        if (timer < 60_000) timer = 60_000;

        if (timer == 0) {
          await errorHandler.handleLiveTrackError(interaction);
        } else if (timer > 600_000) {
          await errorHandler.handleTooLongTrackError(interaction);
        } else {
          const filterEmbed = await interaction.reply({
            embeds: [embed],
            components: [button],
          });

          success = true;

          try {
            const collector = await filterEmbed.createMessageComponentCollector(
              {
                filter: (input) => input.user.id === user.id,
                time: timer,
              }
            );

            collector.on("collect", async (input) => {
              ////////////// apply filters //////////////
              input.deferUpdate();

              if (queue.filters.ffmpeg.filters.length > 0) {
                queue.filters.ffmpeg.setFilters(false);
              }
              if (input.values.length === 0) {
                description = "Filters are disabled.";
              } else {
                if (
                  input.values.includes("bassboost_low") &&
                  !input.values.includes("normalizer")
                ) {
                  input.values.push("normalizer");
                }

                queue.filters.ffmpeg.toggle(input.values);

                ////////////// updating embed //////////////
                description = `**${
                  queue.filters.ffmpeg.filters.length
                }** filters are enabled.\n
                ${input.values
                  .map((enabledFilter) => {
                    let filter = filters.find(
                      (filter) => enabledFilter == filter.value
                    );

                    return `- **${filter.emoji} ${filter.label}**`;
                  })
                  .join("\n")}`;
              }

              embed = createFilterEmbed(description);

              ////////////// updating menu //////////////
              const updatedOptions = filters.map((filter) => {
                const isEnabled = queue.filters.ffmpeg.filters.includes(
                  filter.value
                );

                return new StringSelectMenuOptionBuilder()
                  .setLabel(filter.label)
                  .setDescription(filter.description)
                  .setValue(filter.value)
                  .setEmoji(filter.emoji)
                  .setDefault(isEnabled);
              });

              filterMenu.setOptions(updatedOptions);

              await interaction.editReply({
                embeds: [embed],
                components: [button],
              });
            });
          } catch (error) {
            if (error.code === "InteractionCollectorError") {
              console.error(
                `${consoleTags.error} Interaction response timed out for command ${interaction.commandName}.`
              );
            } else {
              console.error(
                `${consoleTags.error} Something went wrong while awaiting interaction response for command ${interaction.commandName}.`
              );
            }
          }
        }
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
