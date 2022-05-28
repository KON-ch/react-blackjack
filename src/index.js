import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';

import { Deck } from "./deck"
import { Hand } from "./hand"
import { CompareScore } from "./compare_score";
import { Dealer } from "./dealer";
import { Player } from "./player";
import { Bet } from "./bet";
import { Reward } from "./reward";

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
    if (bet.isZero()) {
      return {
        deck: deck,
        dealer: new Dealer(new Hand([])),
        chip: chip,
        progress: 'setup',
        players: [{
          player: new Player(new Hand([])),
          bet: bet,
          reward: new Reward(0),
        }],
        currentPlayerIndex: 0
      }
    }

    // 2. game setup
    const playerCard1 = deck.drawCard()
    const dealerCard1 = deck.drawCard()
    const playerCard2 = deck.drawCard()
    const dealerCard2 = deck.drawCard()

    const player = new Player(new Hand([playerCard1, playerCard2]))
    const dealer = new Dealer(new Hand([dealerCard1, dealerCard2]).cardFaceDown())

    // 3. game finish blackjack
    if (player.isBlackJack() || dealer.isBlackJack()) {
      const result = new CompareScore(player.score, dealer.score)
      const reward = new Reward(result.isPlayerVictory() ? bet.amount * 1.5 : 0)
      const returnBet = result.isDealerVictory() ? bet.remove() : bet

      return {
        deck: deck,
        dealer: dealer,
        chip: chip,
        progress: 'finish',
        players: [{
          player: player,
          bet: returnBet,
          reward: reward,
        }],
        currentPlayerIndex: 0,
      }
    }

    // 4. game start
    return {
      deck: deck,
      dealer: dealer,
      chip: chip,
      progress: 'start',
      players: [{
        player: player,
        bet: bet,
        reward: new Reward(0),
      }],
      currentPlayerIndex: 0
    }
  }

  constructor(props) {
    super(props);
    this.state = this.setup(1000, new Bet(0))
  }

  hitAction(currentPlayer, dealer) {
    const newCard = this.state.deck.drawCard()
    const newPlayer = currentPlayer.player.addCard(newCard)

    const newPlayers = this.state.players.map((player) => {
      if (player !== currentPlayer) {
        return player
      }
      return newPlayer.isBurst() ?
        { player: newPlayer, bet: player.bet.remove(), reward: player.reward } :
        { player: newPlayer, bet: currentPlayer.bet, reward: player.reward }
    })

    this.setState({ players: newPlayers })

    if(newPlayer.isBurst()) {
      if (this.state.currentPlayerIndex < (this.state.players.length - 1)) {
        return this.setState({ currentPlayerIndex: this.state.currentPlayerIndex + 1 })
      }

      if (newPlayers.every((player) => { return (player.bet.isZero()) })) {
        return this.setState({
          dealer: dealer.cardFaceUp(),
          progress: 'finish',
        })
      }

      this.stayAction(dealer, newPlayers, this.state.currentPlayerIndex)
    }
  }

  splitAction(currentPlayer) {
    const  newPlayers = this.state.players.map((player) => {
      if(player !== currentPlayer) { return player }
      return player.player.hand.cards.map((card) => {
        return {
          player: new Player(new Hand([card])),
          bet: currentPlayer.bet,
          reward: currentPlayer.reward
        }
      })
    }).flat()

    this.setState({
      chip: this.state.chip - currentPlayer.bet.amount,
      players: newPlayers
    })

    if (!currentPlayer.player.isTwoAce()) { return }

    const finishPlayers = newPlayers.map((player) => {
      const newCard = this.state.deck.drawCard()
      const newPlayer = player.addCard(newCard)
      return { player: newPlayer, bet: player.bet, reward: player.reward }
    })

    this.stayAction(this.state.dealer, finishPlayers, finishPlayers.length)
  }

  async doubleAction(currentPlayer, dealer) {
    const bet = currentPlayer.bet.doubleDown()
    const chip = this.state.chip - bet.amount

    const newCard = this.state.deck.drawCard()
    const newPlayer = currentPlayer.player.addCard(newCard)

    const newPlayers = this.state.players.map((player) => {
      if (player !== currentPlayer) { return player }
      return newPlayer.isBurst() ?
        { player: newPlayer, bet: bet.remove(), reward: player.reward } :
        { player: newPlayer, bet: bet, reward: player.reward }
    })

    this.setState({ chip: chip, players: newPlayers })

    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await _sleep(300);

    if(newPlayer.isBurst()) {
      if (this.state.currentPlayerIndex < (this.state.players.length - 1)) {
        return this.setState({
          currentPlayerIndex: this.state.currentPlayerIndex + 1
        })
      }

      if (newPlayers.every((player) => { return (player.bet.isZero()) })) {
        return this.setState({
          dealer: dealer.cardFaceUp(),
          progress: 'finish',
        })
      }
    }

    this.stayAction(dealer, newPlayers, this.state.currentPlayerIndex)
  }

  stayAction(dealer, players, currentPlayerIndex) {
    if (currentPlayerIndex < (players.length - 1)) {
      return this.setState({ currentPlayerIndex: currentPlayerIndex + 1 })
    }

    if (dealer.isMustHit()) {
      const newCard = this.state.deck.drawCard()
      const newDealer = dealer.addCard(newCard)

      this.setState({ dealer: newDealer })

      if (newDealer.score.isBurst()) {
        return this.setState({
          progress: 'finish',
          players: players.map((player) => {
            const reward = new Reward(player.bet.totalAmount())
            return { player: player.player, bet: player.bet, reward: reward }
          })
        })
      }

      return this.stayAction(newDealer, players, currentPlayerIndex)
    }

    const evaluatedPlayers = players.map((player) => {
      const result = new CompareScore(player.player.score, dealer.score)

      if (result.isDealerVictory()) {
        return { player: player.player, bet: player.bet.remove(), reward: player.reward }
      }

      if (result.isPlayerVictory()) {
        const reward = new Reward(player.bet.totalAmount())
        return { player: player.player, bet: player.bet, reward: reward }
      }

      return { player: player.player, bet: player.bet, reward: player.reward }
    })

    this.setState({
      dealer: dealer.cardFaceUp(),
      progress: 'finish',
      players: evaluatedPlayers
    })
  }

  render() {
    // Dealer
    const dealer = this.state.dealer

    // Player
    const currentPlayer = this.state.players[this.state.currentPlayerIndex]
    // 右側のプレイヤーからアクションを行う為、表示順を反転している
    const displayPlayers = [...this.state.players].reverse()

    return (
      <div className="game">
        <Chip chip={this.state.chip} role="game-chip" />
        <div className="game-board">
          <div className="dealer">
            <div className="dealer-score">Dealer: { this.state.progress === 'finish' ?  dealer.score.value() : '---' }</div>
            <HandCards role="dealer-hand" cards={dealer.displayHand()} deck={this.state.deck} />
          </div>
          <div className="player">
            {
              displayPlayers.map((player, index) => {
                const currentField = player === currentPlayer ? 'current-field' : ''

                return (
                  <div className={`player-field ${currentField}`} key={index}>
                    <div className="player-score">Player: { player.player.score.value() }</div>
                    <HandCards role="player-hand" cards={player.displayHand()} deck={this.state.deck} />
                    <div className="player-chips">
                      <Chip chip={player.reward.amount} role="reward-chip" />
                      <Chip chip={player.bet.amount} role="player-bet" />
                      <Chip chip={player.bet.doubleDownAmount} role="double-down-bet" />
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
                    { player: currentPlayer.player, bet: currentPlayer.bet.add(50), reward: currentPlayer.reward }
                  ]
                })
              }}
            >
              Bet
            </button>
            <button
              className="button start-button"
              disabled={currentPlayer.bet.isZero() || this.state.progress !== 'setup'}
              onClick={ () => {
                this.setState(this.setup(this.state.chip, currentPlayer.bet))
              }}
            >
              Start
            </button>
            <button
              className="button hit-button"
              disabled={this.state.progress !== 'start'}
              onClick={ () => this.hitAction(currentPlayer, dealer) }
            >
              Hit
            </button>
            <button
              className="button double-button"
              disabled={this.state.progress !== 'start'}
              onClick={ () => this.doubleAction(currentPlayer, dealer) }
            >
              Double
            </button>
            <button
              className="button split-button"
              disabled={(this.state.progress === 'finish' || !currentPlayer.isSplitEnable())}
              onClick={ () => {this.splitAction(currentPlayer)} }
            >
              Split
            </button>
            <button
              className="button stay-button"
              disabled={this.state.progress !== 'start'}
              onClick={() => {this.stayAction(dealer, this.state.players, this.state.currentPlayerIndex)}}
            >
              Stay
            </button>
            <button
              className="button restart-button"
              disabled={this.state.progress !== 'finish'}
              onClick={() => {
                const playersChip = this.state.players.reduce((sum, player) => {
                  return (sum + player.bet.totalAmount() + player.reward.amount)
                }, this.state.chip)
                this.setState(this.setup(playersChip, new Bet(0)))
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
