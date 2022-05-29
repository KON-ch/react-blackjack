import { CalculateScore } from "./calculate_score"
import { Hand } from "./hand"

export class Dealer {
  constructor(hand = new Hand([])) {
    this.hand = hand
    this.score = new CalculateScore(hand.cards)
  }

  cardFaceUp() {
    return new Dealer(this.hand.cardFaceUp())
  }

  setupCard(cards) {
    return new Dealer(new Hand(cards).cardFaceDown(), this.bet, this.reward)
  }

  isMustHit() {
    return this.score.isMustHit()
  }

  addCard(card) {
    return new Dealer(this.hand.addCard(card))
  }

  isBlackJack() {
    return this.score.isBlackJack()
  }

  isBurst() {
    return this.score.isBurst()
  }

  displayHand() {
    return this.hand.display()
  }
}
