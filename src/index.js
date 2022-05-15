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
        dealerHand: new Hand([]),
        chip: chip,
        progress: 'setup',
        players: [{
          hand: new Hand([]),
          bet: 0,
          doubleDownBet: 0,
          reward: 0,
        }],
        currentPlayer: 0
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
        dealerHand: dealerHand,
        chip: chip,
        progress: 'finish',
        players: [{
          hand: playerHand,
          bet: returnBet,
          doubleDownBet: 0,
          reward: reward,
        }],
        currentPlayer: 0,
      }
    }

    // 4. game start
    return {
      deck: deck,
      dealerHand: dealerHand.cardFaceDown(),
      chip: chip,
      progress: 'start',
      players: [{
        hand: playerHand,
        bet: bet,
        doubleDownBet: 0,
        reward: 0,
      }],
      currentPlayer: 0
    }
  }

  constructor(props) {
    super(props);
    this.state = this.setup(1000, 0)
  }

  hitAction(currentPlayer) {
    const newCard = this.state.deck.drawCard()
    const newHand = currentPlayer.hand.addCard(newCard)
    const newScore = new CalculateScore(newHand.cards)

    this.setState({
      players: this.state.players.map((player) => {
        if (player !== currentPlayer) {
          return player
        }
        return { hand: newHand, bet: currentPlayer.bet, doubleDownBet: currentPlayer.doubleDownBet }
      })
    })

    if(newScore.isBurst()) {
      const dealerHand = this.state.dealerHand.cardFaceUp()
      this.setState({
        dealerHand: dealerHand,
        progress: 'finish',
        players: this.state.players.map((player) => {
          if (player !== currentPlayer) {
            return player
          }
          return { hand: newHand, bet: 0, doubleDownBet: 0 }
        })
      })
    }
  }

  splitAction(player) {
    const newPlayers = player.hand.cards.map((card) => {
      return {
        hand: new Hand([card]), bet: player.bet, doubleDownBet: player.doubleDownBet
      }
    })

    this.setState({
      chip: this.state.chip - player.bet,
      players: newPlayers
    })
  }

  async doubleAction(dealerScore, currentPlayer) {
    const bet = currentPlayer.bet
    const chip = this.state.chip - bet

    const newCard = this.state.deck.drawCard()
    const newHand = currentPlayer.hand.addCard(newCard)
    const playerScore = new CalculateScore(newHand.cards)

    const newPlayer = { hand: newHand, bet: bet, doubleDownBet: bet }

    this.setState({
      chip: chip,
      players: this.state.players.map((player) => {
        if (player !== currentPlayer) { return player }
        return newPlayer
      })
    })

    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await _sleep(300);

    const dealerHand = this.state.dealerHand.cardFaceUp()


    if(playerScore.isBurst()) {
      return this.setState({
        dealerHand: dealerHand,
        progress: 'finish',
        players: this.state.players.map((player) => {
          if (player !== currentPlayer) { return player }
          return { hand: newHand, bet: 0, doubleDownBet: 0 }
        })
      })
    }

    this.stayAction(dealerHand, dealerScore, newPlayer)
  }

  stayAction(dealerHand, dealerScore, player) {
    if (this.state.currentPlayer < (this.state.players.length - 1)) {
      return this.setState({ currentPlayer: this.state.currentPlayer + 1 })
    }

    const playerScore = new CalculateScore(player.hand.cards)

    if (dealerScore.isMustHit()) {
      const newCard = this.state.deck.drawCard()
      const newHand = dealerHand.addCard(newCard)

      this.setState({ dealerHand: newHand })

      const newScore = new CalculateScore(newHand.cards)

      if (newScore.isBurst()) {
        return this.setState({
          progress: 'finish',
          reward: player.bet + player.doubleDownBet,
        })
      }

      return this.stayAction(newHand, newScore, player)
    }

    const result = new CompareScore(playerScore, dealerScore)

    if (result.isDealerVictory()) {
      return this.setState({
        dealerHand: dealerHand.cardFaceUp(),
        progress: 'finish',
        players: [
          { hand: player.hand, bet: 0, doubleDownBet: 0 }
        ]
      })
    }

    if (result.isPlayerVictory()) {
      return this.setState({
        dealerHand: dealerHand.cardFaceUp(),
        progress: 'finish',
        reward: player.bet + player.doubleDownBet,
      })
    }

    this.setState({
      dealerHand: dealerHand.cardFaceUp(),
      progress: 'finish',
    })
  }

  render() {
    // Dealer
    const dealerHand = this.state.dealerHand
    const dealerScore = new CalculateScore(dealerHand.cards)

    // Player
    const currentPlayer = this.state.players[this.state.currentPlayer]
    // 右側のプレイヤーからアクションを行う為、表示順を反転している
    const displayPlayers = [...this.state.players].reverse()

    return (
      <div className="game">
        <Chip chip={this.state.chip} role="game-chip" />
        <div className="game-board">
          <div className="dealer">
            <div className="dealer-score">Dealer: { this.state.progress === 'finish' ?  dealerScore.value() : '---' }</div>
            <HandCards role="dealer-hand" cards={dealerHand.display()} deck={this.state.deck} />
          </div>
          <div className="player">
            {
              displayPlayers.map((player, index) => {
                const playerHand = player.hand
                const playerScore = new CalculateScore(playerHand.cards)

                return (
                  <div className="player-field" key={index}>
                    <div className="player-score">Player: { playerScore.value() }</div>
                    <HandCards role="player-hand" cards={playerHand.display()} deck={this.state.deck} />
                    <div className="player-chips">
                      <Chip chip={player.reward} role="reward-chip" />
                      <Chip chip={player.bet} role="player-bet" />
                      <Chip chip={player.doubleDownBet} role="double-down-bet" />
                    </div>
                  </div>
                )
              })
            }
          </div>
          <div className="action">
            <button
              className="button bet-button"
              disabled={this.state.progress !== 'setup'}
              onClick={ () => {
                this.setState({
                  chip: this.state.chip - 50,
                  players: [
                    { hand: currentPlayer.hand, bet: currentPlayer.bet + 50, doubleDownBet: 0 }
                  ]
                })
              }}
            >
              Bet
            </button>
            <button
              className="button start-button"
              disabled={currentPlayer.bet === 0 || this.state.progress !== 'setup'}
              onClick={ () => {
                this.setState(this.setup(this.state.chip, currentPlayer.bet))
              }}
            >
              Start
            </button>
            <button
              className="button hit-button"
              disabled={this.state.progress !== 'start'}
              onClick={ () => this.hitAction(currentPlayer) }
            >
              Hit
            </button>
            <button
              className="button double-button"
              disabled={this.state.progress !== 'start'}
              onClick={ () => this.doubleAction(dealerScore, currentPlayer) }
            >
              Double
            </button>
            <button
              className="button split-button"
              disabled={(this.state.progress === 'finish' || !currentPlayer.hand.isSplitEnable())}
              onClick={ () => {this.splitAction(currentPlayer)} }
            >
              Split
            </button>
            <button
              className="button stay-button"
              disabled={this.state.progress !== 'start'}
              onClick={() => {this.stayAction(dealerHand, dealerScore, currentPlayer)}}
            >
              Stay
            </button>
            <button
              className="button restart-button"
              disabled={this.state.progress !== 'finish'}
              onClick={() => {
                const playersChip = this.state.players.reduce((sum, player) => {
                  return sum + player.bet + player.doubleDownBet + player.reward
                })
                this.setState(this.setup(this.state.chip + playersChip, 0))
              }}
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    )
  }
}

root.render(<Game />);
