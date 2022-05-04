import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';
import { Deck } from "./deck"
import { Hand } from "./hand"
import { HandCards } from "./hand_cards";
import { Chip } from "./chip"

const container = document.getElementById('root');
const root = createRoot(container)

function sortKeys(a, b) {
  const aNumber = Number(Object.keys(a))
  const bNumber = Number(Object.keys(b))
  if (aNumber > bNumber) { return 1 }
  if (aNumber < bNumber) { return -1 }
  return 0
}

class DoubleDownChip extends React.Component {
  render() {
    if (!this.props.doubleDown) { return }

    return <Chip chip={this.props.bet} role="double-down-bet" />
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
        reward: 0,
        betClose: false,
        doubleDown: false
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
      result = this.resultJudgment(playerScore, dealerScore, bet).result
    }

    const reward = result === 'Winner: Player' ? bet * 1.5 : 0

    if (result === 'Winner: Dealer') { bet = 0 }

    return {
      deck: deck,
      playerHand: playerHand,
      dealerHand: dealerHand,
      handClose: result === '',
      result: result,
      chip: chip,
      bet: bet,
      reward: reward,
      betClose: true,
      doubleDown: false,
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

  resultJudgment(playerScore, dealerScore, bet) {
    if (dealerScore === playerScore) {
      return { result: 'Result is Draw' }
    }

    if (dealerScore > playerScore) {
      return { result: 'Winner: Dealer', bet: 0 }
    }

    return { result: 'Winner: Player', reward: bet }
  }

  hitAction() {
    this.state.playerHand.addCard(this.state.deck.drawCard())
    this.setState({ playerHand: this.state.playerHand })

    if(this.calculateScore(this.state.playerHand.hands) > 21) {
      this.setState({ result: 'Winner: Dealer', handClose: false, bet: 0 })
    }
  }

  async doubleAction(dealerScore) {
    const bet = this.state.bet
    const chip = this.state.chip - bet

    this.state.playerHand.addCard(this.state.deck.drawCard())
    this.setState({ chip: chip, doubleDown: true, playerHand: this.state.playerHand })

    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await _sleep(300);

    const playerScore = this.calculateScore(this.state.playerHand.hands)

    if(playerScore > 21) {
      return this.setState({ result: 'Winner: Dealer', handClose: false, bet: 0 })
    }

    this.stayAction(dealerScore, playerScore, bet * 2)
  }

  stayAction(dealerScore, playerScore, bet) {
    const dealerHand = this.state.dealerHand

    this.setState({ handClose: false })

    if (dealerScore < 17) {
      dealerHand.addCard(this.state.deck.drawCard())

      this.setState({ dealerHand: dealerHand })

      const newScore = this.calculateScore(dealerHand.hands)

      if (newScore > 21) {
        return this.setState({ result: 'Winner: Player', reward: bet })
      }

      return this.stayAction(newScore, playerScore, bet)
    }

    this.setState(this.resultJudgment(playerScore, dealerScore, bet))
  }

  render() {
    // Dealer
    const dealerScore = this.calculateScore(this.state.dealerHand.hands)

    this.state.dealerHand.turnCard(this.state.handClose)

    // Player
    const playerScore = this.calculateScore(this.state.playerHand.hands)

    return (
      <div className="game">
        <div className="game-result">
          <Chip chip={this.state.reward} role="reward-chip" />
          { this.state.result }
        </div>
        <Chip chip={this.state.chip} role="game-chip" />
        <div className="game-board">
          <div className="dealer">
            <div className="dealer-score">Dealer: { this.state.handClose ? '---' : dealerScore }</div>
            <div className="dealer-hand">
              <HandCards hands={this.state.dealerHand.display()} deck={this.state.deck} />
            </div>
          </div>
          <div className="player">
            <Chip chip={this.state.bet} role="player-bet" />
            <DoubleDownChip bet={this.state.bet} doubleDown={this.state.doubleDown} />
            <div className="player-score">Player: { playerScore }</div>
            <div className="player-hand">
              <HandCards hands={this.state.playerHand.display()} deck={this.state.deck} />
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
                disabled={(this.state.bet === 0 || this.state.playerHand.hands.length !== 0)}
                onClick={ () => {
                  this.setState(this.setup(this.state.chip, this.state.bet))
                }}
              >
                Start
              </button>
              <button
                className="hit-button"
                disabled={(!this.state.betClose || this.state.result !== '')}
                onClick={ () => this.hitAction() }
              >
                Hit
              </button>
              <button
                className="double-button"
                disabled={(!this.state.betClose || this.state.result !== '')}
                onClick={ () => this.doubleAction(dealerScore) }
              >
                Double
              </button>
              <button
                className="stay-button"
                disabled={(!this.state.betClose || this.state.result !== '')}
                onClick={() => { this.stayAction(dealerScore, playerScore, this.state.bet)}}
              >
                Stay
              </button>
              <button
                className="restart-button"
                disabled={this.state.result === ''}
                onClick={() => { this.setState(this.setup(this.state.chip + this.state.bet + this.state.reward, 0)) }}
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
