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

class Card extends React.Component {
  displayCard(hand){
    return String.fromCodePoint(Object.values(hand))
  }

  render() {
    return this.props.hands.map((hand) => {
      return (
        <span style={this.props.deck.suitColor(hand)} key={Object.values(hand)}>
          {this.displayCard(hand)}
        </span>
      )
    })
  }
}

class Hand {
  constructor(faceDownCard) {
    this.hands = []
    this.faceDown = false
    this.faceDownCard = faceDownCard
  }

  display() {
    if (this.faceDown) {
      return [this.hands[0], this.faceDownCard]
    }
    return this.hands
  }

  addCard(card) {
    this.hands = this.hands.concat(card)
  }

  turnCard(faceDown) {
    this.faceDown = faceDown
  }
}

class Game extends React.Component {
  setup() {
    const deck = new Deck();

    const playerHand = new Hand(deck.faceDownCard())
    const dealerHand = new Hand(deck.faceDownCard())

    playerHand.addCard(deck.drawCard())
    dealerHand.addCard(deck.drawCard())
    playerHand.addCard(deck.drawCard())
    dealerHand.addCard(deck.drawCard())

    let result = ''

    const playerScore = this.calculateScore(playerHand.hands)
    const dealerScore = this.calculateScore(dealerHand.hands)

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
    this.state.playerHand.addCard(this.state.deck.drawCard())
    this.setState({ playerHand: this.state.playerHand })

    if(this.calculateScore(this.state.playerHand.hands) > 21) {
      this.setState({ result: 'Winner: Dealer', handClose: false })
    }
  }

  stayAction(dealerHand, dealerScore, playerScore) {
    this.setState({ handClose: false })

    if (dealerScore < 17) {
      dealerHand.addCard(this.state.deck.drawCard())

      this.setState({ dealerHand: dealerHand })

      const newScore = this.calculateScore(dealerHand.hands)

      if (newScore > 21) {
        return this.setState({ result: 'Winner: Player' })
      }

      return this.stayAction(dealerHand, newScore, playerScore)
    }

    this.setState({ result: this.resultJudgment(playerScore, dealerScore) })
  }

  render() {
    // Dealer
    const dealerScore = this.calculateScore(this.state.dealerHand.hands)

    this.state.dealerHand.turnCard(this.state.handClose)

    // Player
    const playerScore = this.calculateScore(this.state.playerHand.hands)

    return (
      <div className="game">
        <div className="game-result">{ this.state.result }</div>
        <div className="game-board">
          <div className="dealer">
            <div className="dealer-score">Dealer: { this.state.handClose ? '---' : dealerScore }</div>
            <div className="dealer-hand">
              <Card hands={this.state.dealerHand.display()} deck={this.state.deck} />
            </div>
          </div>
          <div className="player">
            <div className="player-score">Player: { playerScore }</div>
            <div className="player-hand">
              <Card hands={this.state.playerHand.display()} deck={this.state.deck} />
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
