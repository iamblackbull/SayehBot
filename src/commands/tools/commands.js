const {
  SlashCommandBuilder,
  EmbedBuilder,
  ApplicationCommandType,
} = require("discord.js");
const utils = require("../../utils/main/mainUtils");
const { pageReact } = require("../../utils/main/handleReaction");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("commands")
    .setDescription("Get a list of available slash commands"),

  async execute(interaction, client) {
    const reply = await interaction.deferReply({
      fetchReply: true,
    });

    const commands = await client.application.commands.fetch();
    const slashCommands = commands.filter(
      (command) => command.type === ApplicationCommandType.ChatInput
    );

    const slashCommandsArray = Array.from(slashCommands.values());
    const sortedSlashCommandsArray = slashCommandsArray.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const totalCommands = sortedSlashCommandsArray.length;
    let page = 0;
    const totalPages = Math.ceil(totalCommands / 10);

    const commandList = sortedSlashCommandsArray
      .slice(page * 10, page * 10 + 10)
      .map((command) => `- **\`/${command.name}\`** : ${command.description}`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle(utils.titles.commands)
      .setDescription(commandList)
      .setColor(utils.colors.default)
      .setFooter({
        iconURL: utils.footers.page,
        text: `Page ${page + 1} of ${totalPages} (${totalCommands} Commands)`,
      });

    await interaction.editReply({
      embeds: [embed],
    });

    ////////////// page switching collector //////////////
    const collector = pageReact(interaction, reply);

    collector.on("collect", async (reaction, user) => {
      if (user.bot) return;

      await reaction.users.remove(user.id);

      if (reaction.emoji.name == "➡" && page < totalPages - 1) {
        page++;
      } else if (reaction.emoji.name == "⬅" && page !== 0) {
        --page;
      } else return;

      const updatedCommandList = sortedSlashCommandsArray
        .slice(page * 10, page * 10 + 10)
        .map((command) => `- **\`/${command.name}\`** : ${command.description}`)
        .join("\n");

      embed.setDescription(updatedCommandList).setFooter({
        iconURL: utils.footers.page,
        text: `Page ${page + 1} of ${totalPages} (${totalCommands} Commands)`,
      });

      interaction.editReply({
        embeds: [embed],
      });
    });

    handleNonMusicalDeletion(interaction, true, 10);
  },
};
