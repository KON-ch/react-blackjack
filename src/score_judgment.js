export class ScoreJudgment {
  constructor(cards) {
    this.cards = cards
  }

  score() {
    const cards = this.cards

    if (cards.length === 0) { return 0 }

    const handValues = cards.map((card) => {
      return card.value
    })

    let aceCount = handValues.filter((value) => value === 11).length

    let totalScore = handValues.reduce((sum, element) => {
      return sum + element
    })

    while (totalScore > 21 && aceCount > 0) {
      totalScore-= 10
      aceCount--
    }

    return totalScore
  }
}
