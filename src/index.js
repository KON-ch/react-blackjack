import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container)

function sortKeys(a, b) {
  const aNumber = Number(Object.keys(a))
  const bNumber = Number(Object.keys(b))
  if (aNumber > bNumber) { return 1 }
  if (aNumber < bNumber) { return -1 }
  return 0
}

class Deck {
  constructor() {
    this.cards = [
      { 11: 127137 }, { 2: 127138 }, { 3: 127139 }, { 4: 127140 }, { 5: 127141 }, { 6: 127142 }, { 7: 127143 }, { 8: 127144 }, { 9: 127145 }, { 10: 127146 }, { 10: 127147 }, { 10: 127149 }, { 10: 127150 },
      { 11: 127153 }, { 2: 127154 }, { 3: 127155 }, { 4: 127156 }, { 5: 127157 }, { 6: 127158 }, { 7: 127159 }, { 8: 127160 }, { 9: 127161 }, { 10: 127162 }, { 10: 127163 }, { 10: 127165 }, { 10: 127166 },
      { 11: 127169 }, { 2: 127170 }, { 3: 127171 }, { 4: 127172 }, { 5: 127173 }, { 6: 127174 }, { 7: 127175 }, { 8: 127176 }, { 9: 127177 }, { 10: 127178 }, { 10: 127179 }, { 10: 127181 }, { 10: 127182 },
      { 11: 127185 }, { 2: 127186 }, { 3: 127187 }, { 4: 127188 }, { 5: 127189 }, { 6: 127190 }, { 7: 127191 }, { 8: 127192 }, { 9: 127193 }, { 10: 127194 }, { 10: 127195 }, { 10: 127197 }, { 10: 127198 },
    ]
  }

  addCard() {
    return this.cards.splice(this.randomNumber(this.cards.length), 1)
  }

  suitColor(card) {
    const cardNumber = Number(Object.values(card))

    if(cardNumber === 127136) { return { color: 'green' } }

    if (cardNumber < 127151 || cardNumber > 127182) { return { color: 'black' } }
    return { color: '#d30000' }
  }

  randomNumber(totalCount) {
    return (
      Math.floor(Math.random() * totalCount - 1) + 1
    )
  }
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
    if (this.state.handClose) { displayDealerHand.splice(1, 1, { pending: '127136' }) }

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
