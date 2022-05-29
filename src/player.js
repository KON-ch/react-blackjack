import { CalculateScore } from "./calculate_score"
import { Hand } from "./hand"
import { Bet } from "./bet"
import { Reward } from "./reward"

export class Player {
  constructor(hand = new Hand([]), bet = new Bet(0), reward = new Reward(0)) {
    this.hand = hand
    this.score = new CalculateScore(hand.cards)
    this.bet = bet
    this.reward = reward
  }

  betAmount() {
    return this.bet.amount
  }

  doubleDownAmount() {
    return this.bet.doubleDownAmount
  }

  rewardAmount() {
    return this.reward.amount
  }

  totalReturnAmount() {
    return this.betAmount() + this.doubleDownAmount() + this.rewardAmount()
  }

  doubleDown() {
    return new Player(this.hand, this.bet.doubleDown(), this.reward)
  }

  hasBet() {
    return !this.bet.isZero()
  }

  addBet(amount) {
    return (new Player(this.hand, this.bet.add(amount), this.reward))
  }

  removeBet() {
    return new Player(this.hand, this.bet.remove(), this.reward)
  }

  setupCard(cards) {
    return new Player(new Hand(cards), this.bet, this.reward)
  }

  addCard(card) {
    return new Player(this.hand.addCard(card), this.bet, this.reward)
  }

  addReward(reward = this.bet.totalAmount()) {
    return new Player(this.hand, this.bet, new Reward(reward))
  }

  splitHand() {
    return this.hand.cards.map((card) => {
      return new Player(new Hand([card]), this.bet, this.reward)
    })
  }

  isBurst() {
    return this.score.isBurst()
  }

  isBlackJack() {
    return this.score.isBlackJack()
  }

  isTwoAce() {
    return this.hand.isTwoAce()
  }

  isSplitEnable() {
    return this.hand.isSplitEnable()
  }

  displayHand() {
    return this.hand.display()
  }
}
