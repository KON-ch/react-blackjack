export class Hand {
  constructor(cards) {
    this.cards = cards
    this.faceDown = false
    this.faceDownCard = { number: 0, value: 0, displayCode: 127136, suit: '' }
  }

  display() {
    if (this.faceDown && this.cards.length === 2) {
      return [this.cards[0], this.faceDownCard]
    }
    return this.cards
  }

  addCard(card) {
    return new Hand(this.cards.concat(card))
  }

  cardFaceDown(boolean) {
    this.faceDown = boolean
  }
}
