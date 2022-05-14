import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';

import { Deck } from "./deck"
import { Hand } from "./hand"
import { ScoreJudgment } from "./score_judgment"
import { ResultJudgment } from "./result_judgment";

// Component
import { HandCards } from "./hand_cards";
import { Chip } from "./chip"

// JSON
import defaultDeck from './deck.json'

const container = document.getElementById('root');
const root = createRoot(container)

class DoubleDownChip extends React.Component {
  render() {
    if (!this.props.doubleDown) { return }

    return <Chip chip={this.props.bet} role="double-down-bet" />
  }
}

class Game extends React.Component {
  setup(chip, bet) {
    // 52枚のカードで毎回開始できるようにディープコピーしている
    const defaultCards = JSON.parse(JSON.stringify((defaultDeck))).cards

    const deck = new Deck(defaultCards)

    // FIXME: 再代入
    let playerCards = []
    let dealerCards = []

    if (bet > 0) {
      playerCards = playerCards.concat(deck.drawCard())
      dealerCards = dealerCards.concat(deck.drawCard())
      playerCards = playerCards.concat(deck.drawCard())
      dealerCards = dealerCards.concat(deck.drawCard())
    }

    const playerHand = new Hand(playerCards)
    const dealerHand = new Hand(dealerCards)

    // FIXME: 再代入
    let resultMessage = ''
    let reward = 0

    const playerScore = new ScoreJudgment(playerHand.cards).score()
    const dealerScore = new ScoreJudgment(dealerHand.cards).score()

    if (playerScore === 21 || dealerScore === 21) {
      const result = new ResultJudgment(playerScore, dealerScore)
      resultMessage = result.resultMessage()
      if (result.isPlayerVictory()) { reward = bet * 1.5 }
      if (result.isDealerVictory()) { bet = 0 }
    }

    return {
      deck: deck,
      playerHand: playerHand,
      dealerHand: dealerHand,
      result: resultMessage,
      chip: chip,
      bet: bet,
      reward: reward,
      // FIXME: フラグ制御
      handClose: resultMessage === '',
      betClose: bet > 0,
      doubleDown: false,
    }
  }

  constructor(props) {
    super(props);
    this.state = this.setup(1000, 0)
  }

  hitAction() {
    const newCard = this.state.deck.drawCard()
    const newHand = this.state.playerHand.addCard(newCard)
    const newScore = new ScoreJudgment(newHand.cards).score()

    this.setState({ playerHand: newHand })

    if(newScore > 21) {
      const result = new ResultJudgment(newScore, 0)
      this.setState({ result: result.resultMessage(), handClose: false, bet: 0 })
    }
  }

  async doubleAction(dealerScore) {
    const bet = this.state.bet
    const chip = this.state.chip - bet

    const newPlayerHand = this.state.playerHand.addCard(this.state.deck.drawCard())
    this.setState({ chip: chip, doubleDown: true, playerHand: newPlayerHand })

    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await _sleep(300);

    const playerScore = new ScoreJudgment(newPlayerHand.cards).score()

    if(playerScore > 21) {
      const result = new ResultJudgment(playerScore, dealerScore)
      return this.setState({ result: result.resultMessage(), handClose: false, bet: 0 })
    }

    this.stayAction(dealerScore, playerScore, bet * 2)
  }

  stayAction(dealerScore, playerScore, bet) {
    this.setState({ handClose: false })

    if (dealerScore < 17) {
      const newCard = this.state.deck.drawCard()
      const newHand = this.state.dealerHand.addCard(newCard)

      this.setState({ dealerHand: newHand })

      const newScore = new ScoreJudgment(newHand.cards).score()

      if (newScore > 21) {
        const result = new ResultJudgment(playerScore, newScore)
        return this.setState({ result: result.resultMessage(), reward: bet })
      }

      return this.stayAction(newScore, playerScore, bet)
    }

    const result = new ResultJudgment(playerScore, dealerScore)

    let resultState
    if (result.isDealerVictory()) { resultState = { bet: 0 } }
    if (result.isPlayerVictory()) { resultState = { reward: bet } }

    this.setState({ result: result.resultMessage(), ...resultState })
  }

  render() {
    // Dealer
    const dealerHand = this.state.dealerHand

    const dealerScore = new ScoreJudgment(dealerHand.cards).score()

    const displayDealerHand = this.state.handClose ? dealerHand.cardFaceDown() : dealerHand

    // Player
    const playerScore = new ScoreJudgment(this.state.playerHand.cards).score()

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
              <HandCards cards={displayDealerHand.display()} deck={this.state.deck} />
            </div>
          </div>
          <div className="player">
            <Chip chip={this.state.bet} role="player-bet" />
            <DoubleDownChip bet={this.state.bet} doubleDown={this.state.doubleDown} />
            <div className="player-score">Player: { playerScore }</div>
            <div className="player-hand">
              <HandCards cards={this.state.playerHand.display()} deck={this.state.deck} />
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
                disabled={(this.state.bet === 0 || this.state.playerHand.cards.length !== 0)}
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
