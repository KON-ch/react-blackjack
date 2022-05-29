export class CalculateScore {
  static MAX_SCORE = 21
  static MUST_HIT_SCORE = 17

  constructor(cards) {
    this.cards = cards
  }

  value() {
    const cards = this.cards

    if (cards.length === 0) { return 0 }

    const handValues = cards.map((card) => {
      return card.value
    })

    // FIXME: 再代入
    let aceCount = handValues.filter((value) => value === 11).length

    let totalScore = handValues.reduce((sum, element) => {
      return sum + element
    })

    while (totalScore > CalculateScore.MAX_SCORE && aceCount > 0) {
      totalScore-= 10
      aceCount--
    }

    return totalScore
  }

  isBurst() {
    return (this.value() > CalculateScore.MAX_SCORE)
  }

  isBlackJack() {
    return (this.value() === CalculateScore.MAX_SCORE)
  }

  isMustHit() {
    return (this.value() < CalculateScore.MUST_HIT_SCORE)
  }
}
