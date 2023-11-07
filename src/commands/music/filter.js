const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { AudioFilters, useTimeline } = require("discord-player");
const { filters } = require("../../utils/musicUtils");
const embedCreator = require("../../utils/createEmbed");
const errorHandler = require("../../utils/handleErrors");
const deletionHandler = require("../../utils/handleDeletion");

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
    .setDescription("Toggle audio filters for the current queue.")
    .setDMPermission(false),

  async execute(interaction, client) {
    ////////////// base variables //////////////
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

        let embed = embedCreator.createFilterEmbed(description);

        const filterMenu = new StringSelectMenuBuilder()
          .setCustomId(`filters`)
          .setPlaceholder("Select which filters to apply")
          .setMinValues(0)
          .setMaxValues(filtersOptions.length)
          .addOptions(filtersOptions);

        const button = new ActionRowBuilder().addComponents(filterMenu);

        const filterEmbed = await interaction.reply({
          embeds: [embed],
          components: [button],
        });

        success = true;

        ////////////// handling menu interaction //////////////
        const { timestamp } = useTimeline(interaction.guildId);
        const duration = timestamp.total.label;
        const convertor = duration.split(":");
        const totalTimer = +convertor[0] * 60 + +convertor[1];

        const currentDuration = timestamp.current.label;
        const currentConvertor = currentDuration.split(":");
        const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

        let timer = totalTimer - currentTimer;

        if (timer > 10 * 60) timer = 10 * 60;
        if (timer < 1 * 60) timer = 1 * 60;

        try {
          const collector = await filterEmbed.createMessageComponentCollector({
            filter: (input) => input.user.id === interaction.user.id,
            time: timer * 1000,
          });

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

            embed = embedCreator.createFilterEmbed(description);

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

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
