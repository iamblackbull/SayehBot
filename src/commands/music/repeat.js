const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useTimeline } = require("discord-player");
const { musicChannelID } = process.env;
let repeatMode = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("repeat")
    .setDescription("Toggle repeat mode of the queue")
    .addStringOption((option) => {
      return option
        .setName(`mode`)
        .setDescription(`Select mode`)
        .setRequired(false)
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
    const repeatEmbed = await interaction.deferReply({
      fetchReply: true,
    });
    const queue = client.player.nodes.get(interaction.guildId);

    let embed = new EmbedBuilder().setColor(0x25bfc4).setTitle(`🔁 Repeat`);
    let failedEmbed = new EmbedBuilder();
    let success = false;

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
      let mode = interaction.options.get("mode").value;
      if (!mode) mode = "track";
      if (!repeatMode) {
        repeatMode = true;
        if (mode === "track") {
          queue.setRepeatMode(1);
          embed.setDescription(
            `Track Repeat mode is **ON**.\nUse </repeat:1047903145071759428> again or react below to turn it off.`
          );
        }
        if (mode === "queue") {
          queue.setRepeatMode(2);
          embed.setDescription(
            `Queue Repeat mode is **ON**.\nUse </repeat:1047903145071759428> again or react below to turn it off.`
          );
        }
        repeatEmbed.react(`❌`);
        const filter = (reaction, user) => {
          [`❌`].includes(reaction.emoji.name) &&
            user.id === interaction.user.id;
        };
        const collector = repeatEmbed.createReactionCollector(filter);
        collector.on("collect", async (reaction, user) => {
          if (user.bot) return;
          else {
            reaction.users.remove(reaction.users.cache.get(user.id));
            repeatMode = false;
            queue.setRepeatMode(0);
            embed.setDescription(
              `Repeat mode is **OFF**.\nUse </repeat:1047903145071759428> again to turn it on.`
            );
            await interaction.editReply({
              embeds: [embed],
            });
            success = true;
          }
        });
      } else if (repeatMode) {
        repeatMode = false;
        queue.setRepeatMode(0);
        embed.setDescription(
          `Repeat mode is **OFF**.\nUse </repeat:1047903145071759428> again to turn it on.`
        );
      }
      await interaction.editReply({
        embeds: [embed],
      });
      success = true;
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

    const timeoutDuration = success ? timer * 1000 : 2 * 60 * 1000;
    const timeoutLog = success
      ? "Failed to delete Repeat interaction."
      : "Failed to delete unsuccessfull Repeat interaction.";
    setTimeout(() => {
      if (success && interaction.channel.id === musicChannelID) {
        repeatEmbed.reactions
          .removeAll()
          .catch((error) =>
            console.error(
              chalk.red("Failed to clear reactions from Repeat interaction."),
              error
            )
          );
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timeoutDuration);
  },
};
