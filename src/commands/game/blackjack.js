const {
  SlashCommandBuilder,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");
const {
  createDeck,
  drawCard,
  calculateScore,
  handToString,
  hasAce,
} = require("../../utils/main/handleDecks");
const utils = require("../../utils/main/mainUtils");
const { maxLevel } = require("../../utils/level/cardUtils");
const { handleXpError } = require("../../utils/main/handleErrors");
const { getUser } = require("../../utils/level/handleLevel");
const { createBlackjackButtons } = require("../../utils/main/createButtons");
const { handleBlackjackXP } = require("../../utils/level/handleLevel");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription(`${utils.tags.new} ${utils.tags.game} Play a round of blackjack with the bot`)
    .addIntegerOption((option) =>
      option
        .setName("bet")
        .setDescription("Bet an amount of your XP on this round")
        .setMinValue(1000)
        .setRequired(true)
    ),

  async execute(interaction) {
    let success = false;
    const { guild, channel } = interaction;

    const bet = interaction.options.getInteger("bet");
    const levelProfile = await getUser(guild.id, interaction.user);

    if (levelProfile.totalxp < bet) {
      handleXpError(interaction, interaction.user);
    } else {
      const deck = createDeck(6);
      const playerHand = [drawCard(deck), drawCard(deck)];
      const dealerHand = [drawCard(deck), drawCard(deck)];

      let playerScore = calculateScore(playerHand);
      let dealerScore = calculateScore(dealerHand);

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.blackjack)
        .setDescription(
          `### Your Hand:\n${handToString(
            playerHand
          )}\n### Dealer's Hand:\n${handToString([dealerHand[0]])} , **??**`
        )
        .setThumbnail(utils.thumbnails.casino)
        .setColor(utils.colors.casino)
        .setFooter({
          iconURL: utils.footers.gamble,
          text: "Dealer must hit soft 17.",
        });

      const button = createBlackjackButtons();

      await interaction.reply({
        embeds: [embed],
        components: [button],
      });

      success = true;
      let result = "";

      const collector = channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 600_000,
      });

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) return;

        if (i.customId === "hit") {
          const newCard = drawCard(deck);
          playerHand.push(newCard);
          playerScore = calculateScore(playerHand);

          i.reply({
            content: `You received: **${newCard.value} ${newCard.suit}**`,
            ephemeral: true,
          });

          if (playerScore > 21) result = utils.results.busted;
        } else if (i.customId === "stand") {
          i.reply({
            content: `You chose to stand.`,
            ephemeral: true,
          });

          while (
            dealerScore < 17 ||
            (dealerScore === 17 && hasAce(dealerHand))
          ) {
            dealerHand.push(drawCard(deck));
            dealerScore = calculateScore(dealerHand);
          }

          if (dealerScore > 21 || playerScore > dealerScore) {
            result = utils.results.won;
          } else if (playerScore < dealerScore) {
            result = utils.results.lost;
          } else {
            result = utils.results.tie;
          }
        }

        if (result === "") {
          embed.setDescription(
            `### Your Hand:\n${handToString(
              playerHand
            )}\n### Dealer's Hand:\n${handToString([dealerHand[0]])} , **??**`
          );

          await interaction.editReply({
            embeds: [embed],
            components: [button],
          });
        } else {
          embed.setDescription(
            `# ${result}
                      \n### Your Hand:\n${handToString(
                        playerHand
                      )} (Score: ${playerScore})\n### Dealer's Hand:\n${handToString(
              dealerHand
            )} (Score: ${dealerScore})`
          );

          await interaction.editReply({
            embeds: [embed],
            components: [],
          });

          collector.stop();

          if (levelProfile.level >= maxLevel) return;
          if (result === utils.results.tie) return;

          const XP = result === utils.results.won ? bet * 2 : bet;

          await handleBlackjackXP(interaction, XP, result);

          const title =
            result === utils.results.won
              ? utils.titles.gamble_winner
              : utils.titles.gamble_loser;
          const mode = result === utils.results.won ? "won" : "lost";
          const color =
            result === utils.results.won
              ? utils.colors.gamble_winner
              : utils.colors.gamble_loser;

          const gambleEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(`${interaction.user} ${mode} **${XP}** XP`)
            .setThumbnail(utils.thumbnails.casino)
            .setColor(color)
            .setFooter({
              iconURL: utils.footers.gamble,
              text: utils.texts.gamble,
            });

          const msg = await interaction.followUp({
            embeds: [gambleEmbed],
          });

          deletionHandler.handleNonMusicalDeletion(msg, success, 10);
        }
      });
    }

    deletionHandler.handleNonMusicalDeletion(interaction, success, 10);
  },
};
