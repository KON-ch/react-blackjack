import defaultDeck from './deck.json'

export class Deck {
  static DEFAULT_CARDS = defaultDeck.cards

  constructor(cards = this.shuffle(Deck.DEFAULT_CARDS)) {
    this.cards = cards
  }

  setup() {
    const [playerCard1, deck1] = this.drawCard()
    const [dealerCard1, deck2] = deck1.drawCard()
    const [playerCard2, deck3] = deck2.drawCard()
    const [dealerCard2, startDeck] = deck3.drawCard()

    return {
      startDeck: startDeck,
      playerCards: [playerCard1, playerCard2],
      dealerCards: [dealerCard1, dealerCard2]
    }
  }

  drawCard() {
    const newCards = this.cards.slice(1)

    return [this.cards[0], new Deck(newCards)]
  }

  shuffle([...array]) {
    for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
