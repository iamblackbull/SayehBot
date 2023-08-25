const {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { AudioFilters, useTimeline } = require("discord-player");
const { musicChannelID } = process.env;

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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Put / Remove filters of the current queue.")
    .addStringOption((option) => {
      return option
        .setName("disable")
        .setDescription("Disable all filters of the current queue.")
        .setRequired(false);
    })
    .setDMPermission(false),
  async execute(interaction, client) {
    const filterEmbed = await interaction.deferReply({
      fetchReply: true,
    });

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

    const queue = client.player.nodes.get(interaction.guildId);

    let filtersOptions = [];
    availableFilters.forEach((filter) => {
      let isEnabled = false;

      if (queue.filters.ffmpeg.filters.includes(filter.value)) isEnabled = true;

      filtersOptions.push(
        new StringSelectMenuOptionBuilder()
          .setLabel(filter.label)
          .setDescription(filter.description)
          .setValue(filter.value)
          .setEmoji(filter.emoji)
          .setDefault(isEnabled)
      );
    });

    const filterMenu = new StringSelectMenuBuilder()
      .setCustomId("filters")
      .setPlaceholder("Select which filters to apply:")
      .setMinValues(0)
      .setMaxValues(filtersOptions.length)
      .addOptions(filtersOptions);

    const disableButton = new ButtonBuilder()
      .setCustomId(`disable`)
      .setLabel("Disable")
      .setStyle(ButtonStyle.Danger);

    let timer;
    let success = false;
    let embed = new EmbedBuilder()
      .setColor(0xc42577)
      .setTitle("✨ Current Filter");

    if (queue.filters.ffmpeg.filters.length > 0) {
      embed.setDescription(
        `**${queue.filters.ffmpeg.filters.length}** filters are enabled.`
      );
    } else {
      embed.setDescription(`Filters are disabled.`);
    }

    let failedEmbed = new EmbedBuilder();

    if (!queue) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `Bot is already not playing in any voice channel.\nUse </play:1047903145071759425> to play a track.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.editReply({
        embeds: [failedEmbed],
      });
    } else if (!interaction.member.voice.channel) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `You need to be in a voice channel to use this command.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.editReply({
        embeds: [failedEmbed],
      });
    } else if (
      queue.connection.joinConfig.channelId ===
      interaction.member.voice.channel.id
    ) {
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

      const collectorFilter = (i) => i.user.id === interaction.user.id;
      try {
        const confirmation = await filterEmbed.awaitMessageComponent({
          filter: collectorFilter,
          time: timer,
        });
        confirmation.deferUpdate();

        if (queue.filters.ffmpeg.filters.length > 0) {
          queue.filters.ffmpeg.setFilters(false);
        }
        if (
          confirmation.customId === "disable" ||
          confirmation.values.length === 0
        ) {
          embed.setDescription("Filters are disabled.");

          await interaction.editReply({
            embeds: [embed],
            components: [],
          });
        } else {
          if (
            confirmation.values.includes("bassboost_low") &&
            !confirmation.values.includes("normalizer")
          ) {
            confirmation.values.push("normalizer");
          }

          queue.filters.ffmpeg.toggle(confirmation.values);

          embed.setDescription(`**${
            queue.filters.ffmpeg.filters.length
          }** filters are enabled.\n
          ${confirmation.values
            .map((enabledFilter) => {
              let filter = availableFilters.find(
                (filter) => enabledFilter == filter.value
              );
              return `- **${filter.emoji} ${filter.label}**`;
            })
            .join("\n")}`);

          await interaction.editReply({
            embeds: [embed],
            components: [],
          });
        }
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
      await interaction.editReply({
        embeds: [embed],
        components: [
          new ActionRowBuilder()
            .addComponents(filterMenu)
            .addComponents(disableButton),
        ],
      });
    } else {
      failedEmbed
        .setTitle(`**Busy**`)
        .setDescription(`Bot is busy in another voice channel.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
        );
      await interaction.editReply({
        embeds: [failedEmbed],
      });
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
