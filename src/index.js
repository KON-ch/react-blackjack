import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';
import { Deck } from "./deck"
import { Hand } from "./hand"

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

class Game extends React.Component {
  setup(chip, bet) {
    const deck = new Deck();

    const playerHand = new Hand(deck.faceDownCard())
    const dealerHand = new Hand(deck.faceDownCard())

    if (bet === 0) {
      return {
        deck: deck,
        playerHand: playerHand,
        dealerHand: dealerHand,
        handClose: false,
        result: '',
        chip: chip,
        bet: bet,
        acquiredBed: 0,
        betClose: false,
      }
    }

    playerHand.addCard(deck.drawCard())
    dealerHand.addCard(deck.drawCard())
    playerHand.addCard(deck.drawCard())
    dealerHand.addCard(deck.drawCard())

    let result = ''

    const playerScore = this.calculateScore(playerHand.hands)
    const dealerScore = this.calculateScore(dealerHand.hands)

    if (playerScore === 21 || dealerScore === 21) {
      result = this.resultJudgment(playerScore, dealerScore).result
    }

    const acquiredBed = result === 'Winner: Player' ? bet * 2.5 : 0

    return {
      deck: deck,
      playerHand: playerHand,
      dealerHand: dealerHand,
      handClose: result === '',
      result: result,
      chip: chip,
      bet: bet,
      acquiredBed: acquiredBed,
      betClose: true,
    }
  }

  constructor(props) {
    super(props);
    this.state = this.setup(1000, 0)
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
      return { result: 'Result is Draw', acquiredBed: this.state.bet }
    }

    if (dealerScore > playerScore) {
      return { result: 'Winner: Dealer' }
    }

    return { result: 'Winner: Player', acquiredBed: this.state.bet * 2 }
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
        return this.setState({ result: 'Winner: Player', acquiredBed: this.state.bet * 2 })
      }

      return this.stayAction(dealerHand, newScore, playerScore)
    }

    this.setState(this.resultJudgment(playerScore, dealerScore))
  }

  render() {
    // Dealer
    const dealerScore = this.calculateScore(this.state.dealerHand.hands)

    this.state.dealerHand.turnCard(this.state.handClose)

    // Player
    const playerScore = this.calculateScore(this.state.playerHand.hands)

    return (
      <div className="game">
        <div className="game-result">{ this.state.result } Acquire: { this.state.acquiredBed } points</div>
        <div className="game-chip">{ this.state.chip }</div>
        <div className="game-board">
          <div className="dealer">
            <div className="dealer-score">Dealer: { this.state.handClose ? '---' : dealerScore }</div>
            <div className="dealer-hand">
              <Card hands={this.state.dealerHand.display()} deck={this.state.deck} />
            </div>
          </div>
          <div className="player">
            <div className="player-bet">{ this.state.bet }</div>
            <div className="player-score">Player: { playerScore }</div>
            <div className="player-hand">
              <Card hands={this.state.playerHand.display()} deck={this.state.deck} />
            </div>
            <div className="player-action">
              <button
                className="bet-button"
                disabled={this.state.betClose}
                onClick={ () => { this.setState({ chip: this.state.chip - 5, bet: this.state.bet + 5 }) }}
              >
                Bet
              </button>
              <button
                className="start-button"
                disabled={this.state.bet === 0}
                onClick={ () => {
                  this.setState(this.setup(this.state.chip, this.state.bet))
                }}
              >
                Start
              </button>
              <button
                className="hit-buton"
                disabled={!this.state.betClose}
                onClick={ () => this.hitAction(playerScore) }
              >
                Hit
              </button>
              <button
                className="stay-button"
                disabled={!this.state.betClose}
                onClick={() => this.stayAction(this.state.dealerHand, dealerScore, playerScore)}
              >
                Stay
              </button>
              <button
                className="restart-button"
                disabled={this.state.result === ''}
                onClick={() => { this.setState(this.setup(this.state.chip + this.state.acquiredBed, 0)) }}
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
