const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { musicChannelID } = process.env;
let paused = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause / Resume the music")
    .setDMPermission(false),
  async execute(interaction, client) {
    const pauseEmbed = await interaction.deferReply({
      fetchReply: true,
    });
    const queue = client.player.getQueue(interaction.guildId);

    let failedEmbed = new EmbedBuilder();
    let embed = new EmbedBuilder();
    let success = false;

    if (!queue) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `Queue is empty. Add at least 1 song to the queue to use this command.`
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
      queue.connection.channel.id === interaction.member.voice.channel.id
    ) {
      if (paused === false) {
        paused = true;
        success = true;
        queue.setPaused(true);
        embed
          .setTitle(`Paused`)
          .setDescription(
            "Use `/pause` again or react below to resume the music."
          )
          .setColor(0x256fc4)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/148/148746.png`
          );

        pauseEmbed.react(`▶`);
        const filter = (reaction, user) => {
          [`▶`].includes(reaction.emoji.name) &&
            user.id === interaction.user.id;
        };
        const collector = pauseEmbed.createReactionCollector(filter);
        collector.on("collect", async (reaction, user) => {
          if (user.bot) return;
          else {
            reaction.users.remove(reaction.users.cache.get(user.id));
            if (reaction.emoji.name === `▶`) {
              if (!queue) return;
              if (!queue.current) return;
              if (paused === false) return;
              pauseEmbed.reactions.removeAll();
              queue.setPaused(false);
              paused = false;
              embed
                .setTitle("Resumed")
                .setDescription("Use `/pause` again to pause the music.")
                .setThumbnail(
                  `https://www.freepnglogos.com/uploads/play-button-png/index-media-cover-art-play-button-overlay-5.png`
                );
              await interaction.editReply({
                embeds: [embed],
              });
            }
          }
        });
        await interaction.editReply({
          embeds: [embed],
        });
      } else if (paused === true) {
        paused = false;
        success = true;
        queue.setPaused(false);
        embed
          .setTitle(`Resumed`)
          .setDescription(
            "Use `/pause` again or react below to pause the music."
          )
          .setColor(0x256fc4)
          .setThumbnail(
            `https://www.freepnglogos.com/uploads/play-button-png/index-media-cover-art-play-button-overlay-5.png`
          );
        pauseEmbed.react(`⏸`);
        const filter = (reaction, user) => {
          [`⏸`].includes(reaction.emoji.name) &&
            user.id === interaction.user.id;
        };
        const collector = pauseEmbed.createReactionCollector(filter);
        collector.on("collect", async (reaction, user) => {
          if (user.bot) return;
          else {
            pauseEmbed.reactions.removeAll();
            if (reaction.emoji.name === `⏸`) {
              if (!queue) return;
              if (!queue.current) return;
              if (paused === true) return;
              queue.setPaused(true);
              paused = true;
              embed
                .setTitle("Paused")
                .setDescription("Use `/pause` again to resume the music.")
                .setThumbnail(
                  `https://cdn-icons-png.flaticon.com/512/148/148746.png`
                );
              await interaction.editReply({
                embeds: [embed],
              });
            }
          }
        });
        await interaction.editReply({
          embeds: [embed],
        });
      }
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
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) {
          pauseEmbed.reactions
            .removeAll()
            .catch((error) =>
              console.error(
                chalk.red("Failed to clear reactions from pause message."),
                error
              )
            );
        } else {
          interaction.deleteReply().catch((e) => {
            console.log(`Failed to delete Pause interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Pause interaction.`);
        });
      }
    }, 10 * 60 * 1000);
  },
};
