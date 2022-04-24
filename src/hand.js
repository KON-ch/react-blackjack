export class Hand {
  constructor(faceDownCard) {
    this.hands = []
    this.faceDown = false
    this.faceDownCard = faceDownCard
  }

  display() {
    if (this.faceDown) {
      return [this.hands[0], this.faceDownCard]
    }
    return this.hands
  }

  addCard(card) {
    this.hands = this.hands.concat(card)
  }

  turnCard(faceDown) {
    this.faceDown = faceDown
  }
}
