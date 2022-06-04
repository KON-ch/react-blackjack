import defaultDeck from './deck.json'

export class Deck {
  constructor() {
    // 52枚のカードで毎回開始できるようにディープコピーしている
    this.cards = JSON.parse(JSON.stringify((defaultDeck))).cards
  }

  setup() {
    const playerCard1 = this.drawCard()
    const dealerCard1 = this.drawCard()
    const playerCard2 = this.drawCard()
    const dealerCard2 = this.drawCard()

    return {
      startDeck: this,
      playerCards: [playerCard1, playerCard2],
      dealerCards: [dealerCard1, dealerCard2]
    }
  }

  drawCard() {
    // FIXME: 破壊的
    return this.cards.splice(this.#randomNumber(this.cards.length), 1)[0]
  }

  #randomNumber(totalCount) {
    return Math.floor(Math.random() * totalCount - 1) + 1
  }
}
