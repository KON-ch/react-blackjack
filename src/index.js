import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';

import { Deck } from "./deck"
import { Hand } from "./hand"
import { CompareScore } from "./compare_score";
import { Dealer } from "./dealer";
import { Player } from "./player";

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
        dealer: new Dealer(new Hand([])),
        chip: chip,
        progress: 'setup',
        players: [{
          player: new Player(new Hand([])),
          bet: 0,
          doubleDownBet: 0,
          reward: 0,
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
      const reward = result.isPlayerVictory() ? bet * 1.5 : 0
      const returnBet = result.isDealerVictory() ? 0 : bet

      return {
        deck: deck,
        dealer: dealer,
        chip: chip,
        progress: 'finish',
        players: [{
          player: player,
          bet: returnBet,
          doubleDownBet: 0,
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
        doubleDownBet: 0,
        reward: 0,
      }],
      currentPlayerIndex: 0
    }
  }

  constructor(props) {
    super(props);
    this.state = this.setup(1000, 0)
  }

  hitAction(currentPlayer, dealer) {
    const newCard = this.state.deck.drawCard()
    const newPlayer = currentPlayer.player.addCard(newCard)

    const newPlayers = this.state.players.map((player) => {
      if (player !== currentPlayer) {
        return player
      }
      return newPlayer.isBurst() ?
        { player: newPlayer, bet: 0, doubleDownBet: 0, reward: 0 } :
        { player: newPlayer, bet: currentPlayer.bet, doubleDownBet: currentPlayer.doubleDownBet, reward: 0 }
    })

    this.setState({ players: newPlayers })

    if(newPlayer.isBurst()) {
      if (this.state.currentPlayerIndex < (this.state.players.length - 1)) {
        return this.setState({ currentPlayerIndex: this.state.currentPlayerIndex + 1 })
      }

      if (newPlayers.every((player) => { return (player.bet === 0) })) {
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
          doubleDownBet: currentPlayer.doubleDownBet,
          reward: 0
        }
      })
    }).flat()

    this.setState({
      chip: this.state.chip - currentPlayer.bet,
      players: newPlayers
    })

    if (!currentPlayer.player.isTwoAce()) { return }

    const finishPlayers = newPlayers.map((player) => {
      const newCard = this.state.deck.drawCard()
      const newPlayer = player.addCard(newCard)
      return { player: newPlayer, bet: player.bet, doubleDownBet: player.doubleDownBet, reward: 0 }
    })

    this.stayAction(this.state.dealer, finishPlayers, finishPlayers.length)
  }

  async doubleAction(currentPlayer, dealer) {
    const bet = currentPlayer.bet
    const chip = this.state.chip - bet

    const newCard = this.state.deck.drawCard()
    const newPlayer = currentPlayer.player.addCard(newCard)

    const newPlayers = this.state.players.map((player) => {
      if (player !== currentPlayer) { return player }
      return newPlayer.isBurst() ?
        { player: newPlayer, bet: 0, doubleDownBet: 0, reward: 0 } :
        { player: newPlayer, bet: bet, doubleDownBet: bet, reward: 0 }
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

      if (newPlayers.every((player) => { return (player.bet === 0) })) {
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
            const reward = player.bet + player.doubleDownBet
            return { player: player.player, bet: player.bet, doubleDownBet: player.doubleDownBet, reward: reward }
          })
        })
      }

      return this.stayAction(newDealer, players, currentPlayerIndex)
    }

    const evaluatedPlayers = players.map((player) => {
      const result = new CompareScore(player.player.score, dealer.score)

      if (result.isDealerVictory()) {
        return { player: player.player, bet: 0, doubleDownBet: 0, reward: 0 }
      }

      if (result.isPlayerVictory()) {
        const reward = player.bet + player.doubleDownBet
        return { player: player.player, bet: player.bet, doubleDownBet: player.doubleDownBet, reward: reward }
      }

      return { player: player.player, bet: player.bet, doubleDownBet: player.doubleDownBet, reward: 0 }
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
                    { player: currentPlayer.player, bet: currentPlayer.bet + 50, doubleDownBet: 0, reward: 0 }
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
                  return (sum + player.bet + player.doubleDownBet + player.reward)
                }, this.state.chip)
                this.setState(this.setup(playersChip, 0))
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
