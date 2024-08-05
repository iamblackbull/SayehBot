function createDeck(numberOfDecks = 6) {
  const suits = ["♥️", "♦️", "♣️", "♠️"];
  const values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];
  const deck = [];

  for (let i = 0; i < numberOfDecks; i++) {
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ value, suit });
      }
    }
  }

  return deck.sort(() => Math.random() - 0.5);
}

function drawCard(deck) {
  return deck.pop();
}

function getCardValue(card) {
  if (["J", "Q", "K"].includes(card.value)) return 10;
  if (card.value === "A") return 11;
  return parseInt(card.value);
}

function calculateScore(hand) {
  let score = 0;
  let aces = 0;

  for (const card of hand) {
    const value = getCardValue(card);
    if (value === 11) aces++;
    score += value;
  }

  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return score;
}

function handToString(hand) {
  return hand.map((card) => `**${card.value} ${card.suit}**`).join(", ");
}

function hasAce(hand) {
  return hand.some((card) => card.value === "A");
}

module.exports = {
  createDeck,
  drawCard,
  calculateScore,
  handToString,
  hasAce,
};
