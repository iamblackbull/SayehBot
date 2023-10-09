const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useTimeline } = require("discord-player");
const { musicChannelID } = process.env;
let repeatMode = false;
const errorHandler = require("../../functions/handlers/handleErrors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("repeat")
    .setDescription("Toggle repeat mode of the current queue.")
    .addStringOption((option) => {
      return option
        .setName(`mode`)
        .setDescription(
          `Select a mode to repeat the current track or repeat the current queue.`
        )
        .setRequired(true)
        .addChoices(
          {
            name: `Track`,
            value: `track`,
          },
          {
            name: `Queue`,
            value: `queue`,
          }
        );
    })
    .setDMPermission(false),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    let success = false;
    let timer;

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
        const repeatEmbed = await interaction.deferReply({
          fetchReply: true,
        });

        let embed = new EmbedBuilder().setColor(0x25bfc4).setTitle(`🔁 Repeat`);
        const mode = interaction.options.get("mode").value;

        if (!repeatMode || repeatMode !== mode) {
          repeatMode = mode;
          switch (mode) {
            case "track":
              queue.setRepeatMode(1);
              break;
            case "queue":
              queue.setRepeatMode(2);
              break;
          }

          embed.setDescription(
            `Repeat mode for ${mode} is **ON**.\nUse </repeat:1047903145071759428> again or react below to turn it off.`
          );
        } else if (repeatMode === mode) {
          repeatMode = false;
          queue.setRepeatMode(0);

          embed.setDescription(
            `Repeat mode for ${mode} **OFF**.\nUse </repeat:1047903145071759428> again to turn it on.`
          );
        }
        await interaction.editReply({
          embeds: [embed],
        });
        success = true;

        repeatEmbed.react(`❌`);
        const filter = (reaction, user) => {
          [`❌`].includes(reaction.emoji.name) &&
            user.id === interaction.user.id;
        };
        const collector = repeatEmbed.createReactionCollector(filter);
        collector.on("collect", async (reaction, user) => {
          if (user.bot) return;

          repeatEmbed.reactions.removeAll();

          repeatMode = false;
          queue.setRepeatMode(0);

          embed.setDescription(
            `Repeat mode is **OFF**.\nUse </repeat:1047903145071759428> again to turn it on.`
          );
          await interaction.editReply({
            embeds: [embed],
          });
          success = true;
        });

        const { timestamp } = useTimeline(interaction.guildId);
        const duration = timestamp.total.label;
        const convertor = duration.split(":");
        const totalTimer = +convertor[0] * 60 + +convertor[1];

        const currentDuration = timestamp.current.label;
        const currentConvertor = currentDuration.split(":");
        const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

        timer = totalTimer - currentTimer;
      }
    }
    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;

    const timeoutDuration = success ? timer * 1000 : 2 * 60 * 1000;
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
