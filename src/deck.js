import deck from '../public/deck.json'

export class Deck {
  constructor() {
    this.cards = deck.cards
  }

  drawCard() {
    return this.cards.splice(this.#randomNumber(this.cards.length), 1)
  }

  suitColor(card) {
    if (card.suit === 'spade' || card.suit === 'club') { return 'black' }
    if (card.suit === 'heart' || card.suit === 'diamond') { return '#d30000' }
    return 'green'
  }

  #randomNumber(totalCount) {
    return Math.floor(Math.random() * totalCount - 1) + 1
  }
}
