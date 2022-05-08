export class ScoreJudgment {
  constructor(hands) {
    this.hands = hands
  }

  score() {
    const hands = this.hands

    if (hands.length === 0) { return 0 }

    const handValues = hands.map((card) => {
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
