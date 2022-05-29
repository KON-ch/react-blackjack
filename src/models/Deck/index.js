import defaultDeck from './deck.json'

export class Deck {
  constructor() {
    // 52枚のカードで毎回開始できるようにディープコピーしている
    this.cards = JSON.parse(JSON.stringify((defaultDeck))).cards
  }

  drawCard() {
    // FIXME: 破壊的
    return this.cards.splice(this.#randomNumber(this.cards.length), 1)[0]
  }

  #randomNumber(totalCount) {
    return Math.floor(Math.random() * totalCount - 1) + 1
  }
}
