const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { musicChannelID } = process.env;
let repeatMode = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("repeat")
    .setDescription("Toggle repeat mode of the queue")
    .setDMPermission(false),
  async execute(interaction, client) {
    const repeatEmbed = await interaction.deferReply({
      fetchReply: true,
    });
    const queue = client.player.getQueue(interaction.guildId);

    let embed = new EmbedBuilder().setColor(0x25bfc4).setTitle(`🔁 Repeat`);
    let failedEmbed = new EmbedBuilder();
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
      if (repeatMode === false) {
        repeatMode = true;
        queue.setRepeatMode(2);
        embed.setDescription(`Repeat mode is **ON**`);
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
            embed.setDescription(`Repeat mode is **OFF**`);
            await interaction.editReply({
              embeds: [embed],
            });
            success = true;
          }
        });
      } else if (repeatMode === true) {
        repeatMode = false;
        queue.setRepeatMode(0);
        embed.setDescription(`Repeat mode is **OFF**`);
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
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) {
          interaction.editReply({ components: [] });
          repeatEmbed.reactions
            .removeAll()
            .catch((error) =>
              console.error(
                chalk.red("Failed to clear reactions from song message."),
                error
              )
            );
        } else {
          interaction.deleteReply().catch((e) => {
            console.log(`Failed to delete Repeat interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Repeat interaction.`);
        });
      }
    }, 10 * 60 * 1000);
  },
};
