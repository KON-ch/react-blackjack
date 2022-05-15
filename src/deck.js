export class Deck {
  constructor(cards) {
    this.cards = cards
  }

  drawCard() {
    // FIXME: 破壊的
    return this.cards.splice(this.#randomNumber(this.cards.length), 1)[0]
  }

  // FIXME:表示カラーの責務
  suitColor(card) {
    if (card.suit === 'spade' || card.suit === 'club') { return 'black' }
    if (card.suit === 'heart' || card.suit === 'diamond') { return '#d30000' }
    return 'green'
  }

  #randomNumber(totalCount) {
    return Math.floor(Math.random() * totalCount - 1) + 1
  }
}
