const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useTimeline } = require("discord-player");
const { musicChannelID } = process.env;
let autoplayMode = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autoplay")
    .setDescription("Toggle autoplay mode of the current queue.")
    .setDMPermission(false),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    let failedEmbed = new EmbedBuilder();
    let success = false;
    let timer;

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
      await interaction.reply({
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
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        failedEmbed
          .setTitle(`**Busy**`)
          .setDescription(`Bot is busy in another voice channel.`)
          .setColor(0x256fc4)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
          );
        await interaction.reply({
          embeds: [failedEmbed],
        });
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

        const { timestamp } = useTimeline(interaction.guildId);
        const duration = timestamp.total.label;
        const convertor = duration.split(":");
        const totalTimer = +convertor[0] * 60 + +convertor[1];

        const currentDuration = timestamp.current.label;
        const currentConvertor = currentDuration.split(":");
        const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

        timer = totalTimer - currentTimer;

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
