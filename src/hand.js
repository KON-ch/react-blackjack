export class Hand {
  constructor(cards) {
    this.cards = cards
  }

  display() {
    return this.cards
  }

  addCard(card) {
    return new Hand(this.cards.concat(card))
  }

  cardFaceDown() {
    return new FaceDownHand(this.cards)
  }
}

class FaceDownHand {
  constructor(cards) {
    this.cards = cards
    this.faceDownCard = { number: 0, value: 0, displayCode: 127136, suit: '' }
  }

  display() {
    const cards = this.cards
    const lastCard = cards.slice(-1)[0]

    return cards.map((card) => {
      if (card === lastCard) {
        return this.faceDownCard
      }

      return card
    })
  }

  addCard(card) {
    return new Hand(this.cards.concat(card))
  }

  cardFaceUp() {
    return new Hand(this.cards)
  }
}
