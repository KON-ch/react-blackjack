export class ResultJudgment {
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
    if(this.playerScore > 21) { return false }
    if(this.dealerScore > 21) { return true }
    return this.playerScore > this.dealerScore
  }

  isDealerVictory() {
    if(this.dealerScore > 21) { return false }
    if(this.playerScore > 21) { return true }
    return this.dealerScore > this.playerScore
  }
}
