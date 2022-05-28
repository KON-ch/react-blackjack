import { CalculateScore } from "./calculate_score"

export class Dealer {
  constructor(hand) {
    this.hand = hand
    this.score = new CalculateScore(hand.cards)
  }

  cardFaceUp() {
    new Dealer(this.hand.cardFaceUp())
  }

  isMustHit() {
    this.score.isMustHit()
  }

  addCard(card) {
    new Dealer(this.hand.addCard(card))
  }

  isBlackJack() {
    this.score.isBlackJack()
  }

  displayHand() {
    this.hand.display()
  }
}
