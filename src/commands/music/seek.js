const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Seek through the current song")
    .addIntegerOption((options) => {
      return options
        .setName("minutes")
        .setDescription("Minutes to seek")
        .setMinValue(1)
        .setRequired(true);
    })
    .setDMPermission(false),
  async execute(interaction, client) {
    const seekEmbed = await interaction.deferReply({
      fetchReply: true,
    });
    let mins = interaction.options.getInteger("minutes");
    const queue = client.player.getQueue(interaction.guildId);

    let failedEmbed = new EmbedBuilder();
    let success = false;
    let timer;

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
      const song = queue.current;
      queue.seek(parseInt(mins) * 60 * 1000);
      let embed = new EmbedBuilder()
        .setTitle(`⏩ Seek`)
        .setDescription(
          `**[${song.title}](${song.url})**\n**${song.author}**\n${mins}:00 to ${song.duration}`
        )
        .setThumbnail(`${song.thumbnail}`)
        .setColor(0x25bfc4);
      seekEmbed.react(`⏮`);
      const filter = (reaction, user) => {
        [`⏮`].includes(reaction.emoji.name) && user.id === interaction.user.id;
      };
      const collector = seekEmbed.createReactionCollector(filter);
      collector.on("collect", async (reaction, user) => {
        if (user.bot) return;
        else {
          reaction.users.remove(reaction.users.cache.get(user.id));
          queue.seek(parseInt(0) * 60 * 1000);
          embed.setDescription(
            `**[${song.title}](${song.url})**\n**${song.author}**\n00:00 to ${song.duration}`
          );
          await interaction.editReply({
            embeds: [embed],
          });
          success = true;
        }
      });
      await interaction.editReply({ embeds: [embed] });
      success = true;
      timer = parseInt(song.duration);
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
    if (success === false) {
      timer = 5;
    }
    if (timer > 10) timer = 10;
    if (timer < 1) timer = 1;
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) {
          interaction.editReply({ components: [] });
          seekEmbed.reactions
            .removeAll()
            .catch((error) =>
              console.error(
                chalk.red("Failed to clear reactions from song message."),
                error
              )
            );
        } else {
          interaction.deleteReply().catch((e) => {
            console.log(`Failed to delete Seek interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Seek interaction.`);
        });
      }
    }, timer * 60 * 1000);
  },
};
