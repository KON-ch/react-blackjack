import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';

import { Deck } from "./deck"
import { CompareScore } from "./compare_score";
import { Dealer } from "./dealer";
import { Player } from "./player";

// Component
import { Chip } from "./components/Chip";
import { HandCards } from "./components/HandCards";
import { PlayerField } from "./components/PlayerField";

// JSON
import defaultDeck from './deck.json'

const container = document.getElementById('root');
const root = createRoot(container)

class Game extends React.Component {
  setup(chip, player) {
    // 52枚のカードで毎回開始できるようにディープコピーしている
    const defaultCards = JSON.parse(JSON.stringify((defaultDeck))).cards

    const deck = new Deck(defaultCards)

    // 1. no bet
    if (!player.hasBet()) {
      return {
        deck: deck,
        dealer: new Dealer(),
        chip: chip,
        progress: 'setup',
        players: [player],
        currentPlayerIndex: 0
      }
    }

    // 2. game setup
    const playerCard1 = deck.drawCard()
    const dealerCard1 = deck.drawCard()
    const playerCard2 = deck.drawCard()
    const dealerCard2 = deck.drawCard()

    const startPlayer = player.setupCard([playerCard1, playerCard2])

    const dealer = new Dealer().setupCard([dealerCard1, dealerCard2])

    // 3. game finish blackjack
    if (startPlayer.isBlackJack() || dealer.isBlackJack()) {
      const result = new CompareScore(startPlayer.score, dealer.score)
      const addedRewardPlayer = result.isPlayerVictory() ? startPlayer.addReward(startPlayer.betAmount() * 1.5) : startPlayer
      const returnBetPlayer = result.isDealerVictory() ? addedRewardPlayer.removeBet() : addedRewardPlayer

      return {
        deck: deck,
        dealer: dealer.cardFaceUp(),
        chip: chip,
        progress: 'finish',
        players: [returnBetPlayer],
        currentPlayerIndex: 0,
      }
    }

    // 4. game start
    return {
      deck: deck,
      dealer: dealer,
      chip: chip,
      progress: 'start',
      players: [startPlayer],
      currentPlayerIndex: 0
    }
  }

  constructor(props) {
    super(props);

    this.state = this.setup(1000, new Player())
  }

  hitAction(currentPlayer, dealer) {
    const newCard = this.state.deck.drawCard()
    const newPlayer = currentPlayer.addCard(newCard)

    const newPlayers = this.state.players.map((player) => {
      if (player !== currentPlayer) {
        return player
      }
      return newPlayer.isBurst() ? newPlayer.removeBet() : newPlayer
    })

    this.setState({ players: newPlayers })

    if(newPlayer.isBurst()) {
      if (this.state.currentPlayerIndex < (this.state.players.length - 1)) {
        return this.setState({ currentPlayerIndex: this.state.currentPlayerIndex + 1 })
      }

      if (newPlayers.every((player) => { return (!player.hasBet()) })) {
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

      return player.splitHand()
    }).flat()

    this.setState({
      chip: this.state.chip - currentPlayer.betAmount(),
      players: newPlayers
    })

    if (!currentPlayer.isTwoAce()) { return }

    const finishPlayers = newPlayers.map((player) => {
      const newCard = this.state.deck.drawCard()
      return player.addCard(newCard)
    })

    this.stayAction(this.state.dealer, finishPlayers, finishPlayers.length)
  }

  async doubleAction(currentPlayer, dealer) {
    const doubleDownPlayer = currentPlayer.doubleDown()
    const chip = this.state.chip - doubleDownPlayer.betAmount()

    const newCard = this.state.deck.drawCard()
    const newPlayer = doubleDownPlayer.addCard(newCard)

    const newPlayers = this.state.players.map((player) => {
      if (player !== currentPlayer) { return player }

      return newPlayer.isBurst() ? newPlayer.removeBet() : newPlayer
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

      if (newPlayers.every((player) => { return (!player.hasBet()) })) {
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

      if (newDealer.isBurst()) {
        return this.setState({
          progress: 'finish',
          players: players.map((player) => {
            return player.addReward()
          })
        })
      }

      return this.stayAction(newDealer, players, currentPlayerIndex)
    }

    const evaluatedPlayers = players.map((player) => {
      const result = new CompareScore(player.score, dealer.score)

      if (result.isDealerVictory()) {
        return player.removeBet()
      }

      if (result.isPlayerVictory()) {
        return player.addReward()
      }

      return player
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
            <HandCards role="dealer-hand" cards={dealer.displayHand()} />
          </div>
          <PlayerField
            players={displayPlayers}
            currentPlayer={currentPlayer}
          />
          <div className="action">
            <button
              className="button bet-button"
              disabled={this.state.progress !== 'setup'}
              onClick={ () => {
                this.setState({ chip: this.state.chip - 50, players: [currentPlayer.addBet(50)] })
              }}
            >
              Bet
            </button>
            <button
              className="button start-button"
              disabled={!currentPlayer.hasBet() || this.state.progress !== 'setup'}
              onClick={ () => {
                this.setState(this.setup(this.state.chip, currentPlayer))
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
                  return (sum + player.totalReturnAmount())
                }, this.state.chip)
                this.setState(this.setup(playersChip, new Player()))
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
