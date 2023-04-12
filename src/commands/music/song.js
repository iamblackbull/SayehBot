const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const chalk = require("chalk");
const { musicChannelID } = process.env;
let paused = false;
let success = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("song")
    .setDescription("Returns info about the current song playing"),
  async execute(interaction, client) {
    const songEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    let queue = client.player.getQueue(interaction.guildId);

    let failedEmbed = new EmbedBuilder();

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
      let bar = queue.createProgressBar({
        timecodes: true,
        queue: false,
        length: 14,
      });

      let song = queue.current;

      let embed = new EmbedBuilder()
        .setTitle("▶ **Currently Playing**")
        .setDescription(
          `**[${song.title}](${song.url})**\n**${song.author}**\n` + bar
        )
        .setColor(0x25bfc4);
      const addButton = new ButtonBuilder()
        .setCustomId(`favorite`)
        .setEmoji(`🤍`)
        .setStyle(ButtonStyle.Danger);
      const removeButton = new ButtonBuilder()
        .setCustomId(`remove-favorite`)
        .setEmoji(`💔`)
        .setStyle(ButtonStyle.Secondary);

      songEmbed.react(`▶`);
      songEmbed.react(`⏸`);
      songEmbed.react(`⏭`);
      const filter = (reaction, user) => {
        [`▶`, `⏸`, `⏭`].includes(reaction.emoji.name) &&
          user.id === interaction.user.id;
      };
      const collector = songEmbed.createReactionCollector(filter);
      collector.on("collect", async (reaction, user) => {
        if (user.bot) return;
        else {
          reaction.users.remove(reaction.users.cache.get(user.id));
          if (reaction.emoji.name === `▶`) {
            if (!queue) return;
            if (!queue.current) return;
            if (paused === false) return;
            queue.setPaused(false);
            paused = false;
            song = queue.current;
            bar = queue.createProgressBar({
              timecodes: true,
              queue: false,
              length: 14,
            });
            embed
              .setTitle("▶ **Currently Playing**")
              .setDescription(
                `**[${song.title}](${song.url})**\n**${song.author}**\n` + bar
              );
            await interaction.editReply({
              embeds: [embed],
              components: [
                new ActionRowBuilder()
                  .addComponents(addButton)
                  .addComponents(removeButton),
              ],
            });
            success = true;
          } else if (reaction.emoji.name === `⏸`) {
            if (!queue) return;
            if (!queue.current) return;
            if (paused === true) return;
            queue.setPaused(true);
            paused = true;
            song = queue.current;
            bar = queue.createProgressBar({
              timecodes: true,
              queue: false,
              length: 14,
            });
            embed
              .setTitle("⏸ **Currently Paused**")
              .setDescription(
                `**[${song.title}](${song.url})**\n**${song.author}**\n` + bar
              );
            await interaction.editReply({
              embeds: [embed],
              components: [
                new ActionRowBuilder()
                  .addComponents(addButton)
                  .addComponents(removeButton),
              ],
            });
            success = true;
          } else if (reaction.emoji.name === `⏭`) {
            if (!queue) return;
            queue.skip();
            song = queue.current;
            bar = queue.createProgressBar({
              timecodes: true,
              queue: false,
              length: 14,
            });
            embed.setDescription(
              `**[${song.title}](${song.url})**\n**${song.author}**\n` + bar
            );
            await interaction.editReply({
              embeds: [embed],
              components: [
                new ActionRowBuilder()
                  .addComponents(addButton)
                  .addComponents(removeButton),
              ],
            });
            success = true;
          }
        }
      });

      await interaction.editReply({
        embeds: [embed],
        components: [
          new ActionRowBuilder()
            .addComponents(addButton)
            .addComponents(removeButton),
        ],
      });
      success = true;
    } else {
      failedEmbed
        .setTitle(`**Bot is busy**`)
        .setDescription(`Bot is busy in another voice channel.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
        );
      await interaction.editReply({
        embeds: [failedEmbed],
      });
    }
    if (success === false) {
      timer = 10;
    }
    if (timer > 10) timer = 10;
    if (timer < 1) timer = 1;
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) {
          interaction.editReply({ components: [] });
          songEmbed.reactions
            .removeAll()
            .catch((error) =>
              console.error(
                chalk.red("Failed to clear reactions from song message."),
                error
              )
            );
        } else {
          interaction.deleteReply().catch(console.error);
        }
      } else {
        interaction.deleteReply().catch(console.error);
      }
    }, timer * 60 * 1000);
  },
};
