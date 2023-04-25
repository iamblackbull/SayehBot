const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const chalk = require("chalk");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Manage giveaways (moderators-only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("start")
        .setDescription("Start a giveaway (moderators-only)")
        .addStringOption((option) =>
          option
            .setName("duration")
            .setDescription("Provide a duration")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("winners")
            .setDescription("Amount of winners")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("prize")
            .setDescription("Provide the name of prize")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to perform giveaway in")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("action")
        .setDescription("Manage the current giveaway (moderators-only)")
        .addStringOption((option) =>
          option
            .setName("options")
            .setDescription("Select an option")
            .setRequired(true)
            .addChoices(
              {
                name: "End",
                value: "end",
              },
              {
                name: "Pause",
                value: "pause",
              },
              {
                name: "Resume",
                value: "unpause",
              },
              {
                name: "Delete",
                value: "delete",
              }
            )
        )
        .addStringOption((option) =>
          option
            .setName("message-id")
            .setDescription("Provide the message-id of the giveaway")
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    const member = interaction.member;

    const { options } = interaction;
    const Sub = options.getSubcommand();

    const errorEmbed = new EmbedBuilder().setColor(0xe01010);

    const successEmbed = new EmbedBuilder().setColor(0x46eb34);

    switch (Sub) {
      case "start":
        {
          const gChannel = options.getChannel("channel") || interaction.channel;
          const duration = options.getString("duration");
          const winnerCount = options.getInteger("winners");
          const prize = options.getString("prize");

          client.giveawaysManager
            .start(gChannel, {
              duration: ms(duration),
              winnerCount,
              prize,
              messages: {
                giveaway: "🎉 **Giveaway has begun !** 🎉",
                giveawayEnded: "Giveaway expired !",
                winMessage:
                  "🏆 Conratulations, {winners}! You won **{this.prize}** ! 🎉",
              },
            })
            .then(async () => {
              successEmbed.setDescription(
                "✅ Giveaway was Successfully started !"
              );
              return interaction.reply({
                embeds: [successEmbed],
                ephemeral: true,
              });
            })
            .catch((err) => {
              errorEmbed.setDescription("An error occurred...");
              return interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true,
              });
            });
        }
        break;

      case "action":
        {
          const choice = options.getString("options");
          const meesageId = options.getString("message-id");
          switch (choice) {
            case "end":
              {
                client.giveawaysManager
                  .end(meesageId)
                  .then(() => {
                    successEmbed.setDescription("🏁 Giveaway has ended !");
                    return interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription("An error occurred...");
                    return interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
            case "pause":
              {
                client.giveawaysManager
                  .pause(meesageId)
                  .then(() => {
                    successEmbed.setDescription("⏸ Giveaway has been paused !");
                    return interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription("An error occurred...");
                    return interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
            case "unpause":
              {
                client.giveawaysManager
                  .unpause(meesageId)
                  .then(() => {
                    successEmbed.setDescription(
                      "▶ Giveaway has been resumed !"
                    );
                    return interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription("An error occurred...");
                    return interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
            case "delete":
              {
                client.giveawaysManager
                  .delete(meesageId)
                  .then(() => {
                    successEmbed.setDescription(
                      "🚮 Giveaway has been removed !"
                    );
                    return interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription("An error occurred...");
                    return interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
          }
        }
        break;

      default: {
        console.log(
          chalk.yellow(
            "Something went wrong while executing giveaway command..."
          )
        );
      }
    }
  },
};
