export class Deck {
  constructor(cards) {
    this.cards = cards
  }

  drawCard() {
    // FIXME: 破壊的
    return this.cards.splice(this.#randomNumber(this.cards.length), 1)[0]
  }

  #randomNumber(totalCount) {
    return Math.floor(Math.random() * totalCount - 1) + 1
  }
}
