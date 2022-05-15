import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';

import { Deck } from "./deck"
import { Hand } from "./hand"
import { CalculateScore } from "./calculate_score"
import { CompareScore } from "./compare_score";

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

    const playerScore = new CalculateScore(playerHand.cards)
    const dealerScore = new CalculateScore(dealerHand.cards)

    // 3. game finish blackjack
    if (playerScore.isBlackJack() || dealerScore.isBlackJack()) {
      const result = new CompareScore(playerScore, dealerScore)
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
    const newScore = new CalculateScore(newHand.cards)

    this.setState({ playerHand: newHand })

    if(newScore.isBurst()) {
      const dealerScore = new CalculateScore(this.state.dealerHand.cards)
      const result = new CompareScore(newScore, dealerScore)
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
    const playerScore = new CalculateScore(newHand.cards)

    this.setState({ playerHand: newHand })

    const dealerHand = this.state.dealerHand.cardFaceUp()

    if(playerScore.isBurst()) {
      const result = new CompareScore(playerScore, dealerScore)
      return this.setState({ result: result.resultMessage(), dealerHand: dealerHand, bet: 0, doubleDownBet: 0, progress: 'finish' })
    }

    this.stayAction(dealerHand, dealerScore, playerScore, bet * 2)
  }

  stayAction(dealerHand, dealerScore, playerScore, bet) {
    if (dealerScore.isMustHit()) {
      const newCard = this.state.deck.drawCard()
      const newHand = dealerHand.addCard(newCard)

      this.setState({ dealerHand: newHand })

      const newScore = new CalculateScore(newHand.cards)

      if (newScore.isBurst()) {
        const result = new CompareScore(playerScore, newScore)
        return this.setState({ result: result.resultMessage(), reward: bet, progress: 'finish' })
      }

      return this.stayAction(newHand, newScore, playerScore, bet)
    }

    const result = new CompareScore(playerScore, dealerScore)

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
    const dealerScore = new CalculateScore(dealerHand.cards)

    // Player
    const playerHand = this.state.playerHand
    const playerScore = new CalculateScore(playerHand.cards)

    return (
      <div className="game">
        <div className="game-result">
          <Chip chip={this.state.reward} role="reward-chip" />
          { this.state.result }
        </div>
        <Chip chip={this.state.chip} role="game-chip" />
        <div className="game-board">
          <div className="dealer">
            <div className="dealer-score">Dealer: { this.state.progress === 'finish' ?  dealerScore.value() : '---' }</div>
            <HandCards role="dealer-hand" cards={dealerHand.display()} deck={this.state.deck} />
          </div>
          <div className="player">
            <Chip chip={this.state.bet} role="player-bet" />
            <Chip chip={this.state.doubleDownBet} role="double-down-bet" />
            <div className="player-score">Player: { playerScore.value() }</div>
            <HandCards role="player-hand" cards={playerHand.display()} deck={this.state.deck} />
            <div className="player-action">
              <button
                className="bet-button"
                disabled={this.state.progress !== 'setup'}
                onClick={ () => { this.setState({ chip: this.state.chip - 50, bet: this.state.bet + 50 }) }}
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
