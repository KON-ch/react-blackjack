import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';
import { Deck } from "./deck"

const container = document.getElementById('root');
const root = createRoot(container)

function sortKeys(a, b) {
  const aNumber = Number(Object.keys(a))
  const bNumber = Number(Object.keys(b))
  if (aNumber > bNumber) { return 1 }
  if (aNumber < bNumber) { return -1 }
  return 0
}


class Game extends React.Component {
  setup() {
    const deck = new Deck();

    let playerHand = []
    let dealerHand = []

    playerHand = playerHand.concat(deck.addCard())
    dealerHand = dealerHand.concat(deck.addCard())
    playerHand = playerHand.concat(deck.addCard())
    dealerHand = dealerHand.concat(deck.addCard())

    let result = ''

    const playerScore = this.calculateScore(playerHand)
    const dealerScore = this.calculateScore(dealerHand)

    if (playerScore === 21 || dealerScore === 21) {
      result = this.resultJudgment(playerScore, dealerScore)
    }

    return {
      deck: deck,
      playerHand: playerHand,
      dealerHand: dealerHand,
      handClose: result === '',
      result: result,
    }
  }

  constructor(props) {
    super(props);
    this.state = this.setup()
  }

  calculateScore(allHand) {
    const sortHand = JSON.parse(JSON.stringify(allHand)).sort((a,b) => sortKeys(a, b))

    let totalScore = 0

    let aceCount = 0

    for(const hand of sortHand) {
      const score = Number(Object.keys(hand))
      totalScore += score

      if (score === 11) {
        aceCount++

        if (totalScore > 21) {
          totalScore -= 10
          aceCount--
        }
      }
    }

    if (aceCount !== 0 && totalScore > 21 ) { totalScore -= 10 }

    return totalScore
  }

  resultJudgment(playerScore, dealerScore) {
    if (dealerScore === playerScore) {
      return 'Result is Draw'
    }

    if (dealerScore > playerScore) {
      return 'Winner: Dealer'
    }

    return 'Winner: Player'
  }

  hitAction() {
    const newHand =  this.state.playerHand.concat(this.state.deck.addCard())
    this.setState({ playerHand: newHand })

    if(this.calculateScore(newHand) > 21) {
      this.setState({ result: 'Winner: Dealer', handClose: false })
    }
  }

  stayAction(dealerHand, dealerScore, playerScore) {
    this.setState({ handClose: false })

    if (dealerScore < 17) {
      const newHand = dealerHand.concat(this.state.deck.addCard())

      this.setState({ dealerHand: newHand })

      const newScore = this.calculateScore(newHand)

      if (newScore > 21) {
        return this.setState({ result: 'Winner: Player' })
      }

      return this.stayAction(newHand, newScore, playerScore)
    }

    this.setState({ result: this.resultJudgment(playerScore, dealerScore) })
  }

  render() {
    // Dealer
    const dealerScore = this.calculateScore(this.state.dealerHand)

    let displayDealerHand = JSON.parse(JSON.stringify(this.state.dealerHand))
    if (this.state.handClose) { displayDealerHand.splice(1, 1, this.state.deck.faceDownCard()) }

    // Player
    const playerScore = this.calculateScore(this.state.playerHand)

    return (
      <div className="game">
        <div className="game-result">{ this.state.result }</div>
        <div className="game-board">
          <div className="dealer">
            <div className="dealer-score">Dealer: { this.state.handClose ? '---' : dealerScore }</div>
            <div className="dealer-hand">
              {
                displayDealerHand.map((hand) => {
                  return (
                    <span style={this.state.deck.suitColor(hand)} key={Object.values(hand)}>
                      {String.fromCodePoint(Object.values(hand))}
                    </span>
                  )
                })
              }
            </div>
          </div>
          <div className="player">
            <div className="player-score">Player: { playerScore }</div>
            <div className="player-hand">
              {
                this.state.playerHand.map((hand) => {
                  return (
                    <span style={this.state.deck.suitColor(hand)} key={Object.values(hand)}>
                      {String.fromCodePoint(Object.values(hand))}
                    </span>
                  )
                })
              }
            </div>
            <div className="player-action">
              <button
                className="hit-buton"
                disabled={!this.state.handClose}
                onClick={ () => this.hitAction(playerScore) }
              >
                Hit
              </button>
              <button
                className="stay-button"
                disabled={this.state.result !== ''}
                onClick={() => this.stayAction(this.state.dealerHand, dealerScore, playerScore)}
              >
                Stay
              </button>
              <button
                className="restart-button"
                disabled={this.state.result === ''}
                onClick={() => { this.setState(this.setup()) }}
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

root.render(<Game />);
