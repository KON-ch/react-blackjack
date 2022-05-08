export class Hand {
  constructor(hands) {
    this.hands = hands
    this.faceDown = false
    this.faceDownCard = { number: 0, value: 0, displayCode: 127136, suit: '' }
  }

  display() {
    if (this.faceDown && this.hands.length === 2) {
      return [this.hands[0], this.faceDownCard]
    }
    return this.hands
  }

  addCard(card) {
    new Hand(this.hands.concat(card))
  }

  cardFaceDown(boolean) {
    this.faceDown = boolean
  }
}
