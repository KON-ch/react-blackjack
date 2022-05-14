import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';

import { Deck } from "./deck"
import { Hand } from "./hand"
import { CalculateValue } from "./calculate_value"
import { ResultJudgment } from "./result_judgment";

// Component
import { HandCards } from "./hand_cards";
import { Chip } from "./chip"

// JSON
import defaultDeck from './deck.json'

const container = document.getElementById('root');
const root = createRoot(container)

class Game extends React.Component {
  setup(chip, bet) {
    // 52枚のカードで毎回開始できるようにディープコピーしている
    const defaultCards = JSON.parse(JSON.stringify((defaultDeck))).cards

    const deck = new Deck(defaultCards)

    // 1. no bet
    if (bet === 0) {
      return {
        deck: deck,
        playerHand: new Hand([]),
        dealerHand: new Hand([]),
        result: '',
        chip: chip,
        bet: bet,
        reward: 0,
        doubleDownBet: 0,
        progress: 'setup'
      }
    }

    // 2. game setup
    const playerCard1 = deck.drawCard()
    const dealerCard1 = deck.drawCard()
    const playerCard2 = deck.drawCard()
    const dealerCard2 = deck.drawCard()

    const playerHand = new Hand([playerCard1, playerCard2])
    const dealerHand = new Hand([dealerCard1, dealerCard2])

    const playerScore = new CalculateValue(playerHand.cards).score()
    const dealerScore = new CalculateValue(dealerHand.cards).score()

    // 3. game finish blackjack
    if (playerScore === 21 || dealerScore === 21) {
      const result = new ResultJudgment(playerScore, dealerScore)
      const reward = result.isPlayerVictory() ? bet * 1.5 : 0
      const returnBet = result.isDealerVictory() ? 0 : bet

      return {
        deck: deck,
        playerHand: playerHand,
        dealerHand: dealerHand,
        result: result.resultMessage(),
        chip: chip,
        bet: returnBet,
        reward: reward,
        doubleDownBet: 0,
        progress: 'finish'
      }
    }

    // 4. game start
    return {
      deck: deck,
      playerHand: playerHand,
      dealerHand: dealerHand.cardFaceDown(),
      result: '',
      chip: chip,
      bet: bet,
      reward: 0,
      doubleDownBet: 0,
      progress: 'start'
    }
  }

  constructor(props) {
    super(props);
    this.state = this.setup(1000, 0)
  }

  hitAction() {
    const newCard = this.state.deck.drawCard()
    const newHand = this.state.playerHand.addCard(newCard)
    const newScore = new CalculateValue(newHand.cards).score()

    this.setState({ playerHand: newHand })

    if(newScore > 21) {
      const result = new ResultJudgment(newScore, 0)
      const dealerHand = this.state.dealerHand.cardFaceUp()
      this.setState({ result: result.resultMessage(), dealerHand: dealerHand, bet: 0, doubleDownBet: 0, progress: 'finish' })
    }
  }

  async doubleAction(dealerScore) {
    const bet = this.state.bet
    const chip = this.state.chip - bet

    this.setState({ chip: chip, doubleDownBet: bet })

    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await _sleep(300);

    const newCard = this.state.deck.drawCard()
    const newHand = this.state.playerHand.addCard(newCard)
    const playerScore = new CalculateValue(newHand.cards).score()

    this.setState({ playerHand: newHand })

    const dealerHand = this.state.dealerHand.cardFaceUp()

    if(playerScore > 21) {
      const result = new ResultJudgment(playerScore, dealerScore)
      return this.setState({ result: result.resultMessage(), dealerHand: dealerHand, bet: 0, doubleDownBet: 0, progress: 'finish' })
    }

    this.stayAction(dealerHand, dealerScore, playerScore, bet * 2)
  }

  stayAction(dealerHand, dealerScore, playerScore, bet) {
    if (dealerScore < 17) {
      const newCard = this.state.deck.drawCard()
      const newHand = dealerHand.addCard(newCard)

      this.setState({ dealerHand: newHand })

      const newScore = new CalculateValue(newHand.cards).score()

      if (newScore > 21) {
        const result = new ResultJudgment(playerScore, newScore)
        return this.setState({ result: result.resultMessage(), reward: bet, progress: 'finish' })
      }

      return this.stayAction(newHand, newScore, playerScore, bet)
    }

    const result = new ResultJudgment(playerScore, dealerScore)

    if (result.isDealerVictory()) {
      return this.setState({
        result: result.resultMessage(), bet: 0, doubleDownBet: 0, dealerHand: dealerHand.cardFaceUp(), progress: 'finish'
      })
    }
    if (result.isPlayerVictory()) {
      return this.setState({
        result: result.resultMessage(), reward: bet, dealerHand: dealerHand.cardFaceUp(), progress: 'finish'
      })
    }

    this.setState({ result: result.resultMessage(), dealerHand: dealerHand.cardFaceUp(), progress: 'finish' })
  }

  render() {
    // Dealer
    const dealerHand = this.state.dealerHand
    const dealerScore = new CalculateValue(dealerHand.cards).score()

    // Player
    const playerHand = this.state.playerHand
    const playerScore = new CalculateValue(playerHand.cards).score()

    return (
      <div className="game">
        <div className="game-result">
          <Chip chip={this.state.reward} role="reward-chip" />
          { this.state.result }
        </div>
        <Chip chip={this.state.chip} role="game-chip" />
        <div className="game-board">
          <div className="dealer">
            <div className="dealer-score">Dealer: { this.state.progress === 'finish' ?  dealerScore : '---' }</div>
            <div className="dealer-hand">
              <HandCards cards={dealerHand.display()} deck={this.state.deck} />
            </div>
          </div>
          <div className="player">
            <Chip chip={this.state.bet} role="player-bet" />
            <Chip chip={this.state.doubleDownBet} role="double-down-bet" />
            <div className="player-score">Player: { playerScore }</div>
            <div className="player-hand">
              <HandCards cards={playerHand.display()} deck={this.state.deck} />
            </div>
            <div className="player-action">
              <button
                className="bet-button"
                disabled={this.state.progress !== 'setup'}
                onClick={ () => { this.setState({ chip: this.state.chip - 5, bet: this.state.bet + 5 }) }}
              >
                Bet
              </button>
              <button
                className="start-button"
                disabled={this.state.bet === 0 || this.state.progress !== 'setup'}
                onClick={ () => {
                  this.setState(this.setup(this.state.chip, this.state.bet))
                }}
              >
                Start
              </button>
              <button
                className="hit-button"
                disabled={this.state.progress !== 'start'}
                onClick={ () => this.hitAction() }
              >
                Hit
              </button>
              <button
                className="double-button"
                disabled={this.state.progress !== 'start'}
                onClick={ () => this.doubleAction(dealerScore) }
              >
                Double
              </button>
              <button
                className="stay-button"
                disabled={this.state.progress !== 'start'}
                onClick={() => {this.stayAction(dealerHand, dealerScore, playerScore, this.state.bet)}}
              >
                Stay
              </button>
              <button
                className="restart-button"
                disabled={this.state.progress !== 'finish'}
                onClick={() => { this.setState(this.setup(this.state.chip + this.state.bet + this.state.doubleDownBet + this.state.reward, 0)) }}
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
