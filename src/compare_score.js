export class CompareScore {
  constructor(playerScore, dealerScore) {
    this.playerScore = playerScore
    this.dealerScore = dealerScore
  }

  resultMessage() {
    if (this.isPlayerVictory()) { return 'Winner: Player' }
    if (this.isDealerVictory()) { return 'Winner: Dealer' }
    return 'Result is Draw'
  }

  isPlayerVictory() {
    if(this.playerScore.isBurst()) { return false }
    if(this.dealerScore.isBurst()) { return true }
    return this.playerScore.value() > this.dealerScore.value()
  }

  isDealerVictory() {
    if(this.dealerScore.isBurst()) { return false }
    if(this.playerScore.isBurst()) { return true }
    return this.dealerScore.value() > this.playerScore.value()
  }
}
