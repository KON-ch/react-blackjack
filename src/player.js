import { CalculateScore } from "./calculate_score"

export class Player {
  constructor(hand) {
    this.hand = hand
    this.score = new CalculateScore(hand.cards)
  }

  addCard(card) {
    new Player(this.hand.addCard(card))
  }

  isBurst() {
    this.score.isBurst()
  }

  isBlackJack() {
    this.score.isBlackJack()
  }

  isTwoAce() {
    this.hand.isTwoAce()
  }

  isSplitEnable() {
    this.hand.isSplitEnable()
  }

  displayHand() {
    this.hand.display()
  }
}
