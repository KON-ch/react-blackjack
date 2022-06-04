import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';

// Models
import { Deck } from "./models/Deck"
import { Dealer } from "./models/Dealer";
import { Player } from "./models/Player";
import { CompareScore } from "./models/CompareScore";
import { Progress } from "./models/Progress";

// Components
import { ActionButtons } from "./components/ActionButtons";
import { Chip } from "./components/Chip";
import { HandCards } from "./components/HandCards";
import { PlayerField } from "./components/PlayerField";

const container = document.getElementById('root');
const root = createRoot(container)

class Game extends React.Component {
  setup(deck, chip, player) {
    const progress = new Progress()

    // 1. no bet
    if (!player.hasBet()) {
      return {
        deck: deck,
        dealer: new Dealer(),
        chip: chip,
        progress: progress,
        players: [player],
        currentPlayerIndex: 0
      }
    }

    // 2. game setup
    const { startDeck, playerCards, dealerCards } = deck.setup()

    const startPlayer = player.setupCard(playerCards)

    const dealer = new Dealer().setupCard(dealerCards)

    // 3. game finish blackjack
    if (startPlayer.isBlackJack() || dealer.isBlackJack()) {
      const result = new CompareScore(startPlayer.score, dealer.score)
      const addedRewardPlayer = result.isPlayerVictory() ? startPlayer.addReward(startPlayer.betAmount() * 1.5) : startPlayer
      const returnBetPlayer = result.isDealerVictory() ? addedRewardPlayer.removeBet() : addedRewardPlayer

      return {
        deck: startDeck,
        dealer: dealer.cardFaceUp(),
        chip: chip,
        progress: progress.finish(),
        players: [returnBetPlayer],
        currentPlayerIndex: 0,
      }
    }

    // 4. game start
    return {
      deck: startDeck,
      dealer: dealer,
      chip: chip,
      progress: progress.next(),
      players: [startPlayer],
      currentPlayerIndex: 0
    }
  }

  constructor(props) {
    super(props);

    this.state = this.setup(new Deck(), 1000, new Player())
  }

  hitAction(currentPlayer, dealer) {
    const [newCard, newDeck] = this.state.deck.drawCard()
    const newPlayer = currentPlayer.addCard(newCard)

    const newPlayers = this.state.players.map((player) => {
      if (player !== currentPlayer) {
        return player
      }
      return newPlayer.isBurst() ? newPlayer.removeBet() : newPlayer
    })

    this.setState({ deck: newDeck, players: newPlayers })

    if(newPlayer.isBurst()) {
      if (this.state.currentPlayerIndex < (this.state.players.length - 1)) {
        return this.setState({ currentPlayerIndex: this.state.currentPlayerIndex + 1 })
      }

      if (newPlayers.every((player) => { return (!player.hasBet()) })) {
        return this.setState({
          dealer: dealer.cardFaceUp(),
          progress: this.state.progress.finish(),
        })
      }

      this.stayAction(newDeck, dealer, newPlayers, this.state.currentPlayerIndex)
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

    const [addCard1, deck1] = this.state.deck.drawCard()
    const [addCard2, newDeck] = deck1.drawCard()

    const addCards = [addCard1, addCard2]
    let addCounter = -1

    const finishPlayers = newPlayers.map((player) => {
      if (player.hand.cards.length !== 1) { return player }

      return player.addCard(addCards[addCounter += 1])
    })

    this.stayAction(newDeck, this.state.dealer, finishPlayers, finishPlayers.length)
  }

  async doubleAction(currentPlayer, dealer) {
    const doubleDownPlayer = currentPlayer.doubleDown()
    const chip = this.state.chip - doubleDownPlayer.betAmount()

    const [newCard, newDeck] = this.state.deck.drawCard()
    const newPlayer = doubleDownPlayer.addCard(newCard)

    const newPlayers = this.state.players.map((player) => {
      if (player !== currentPlayer) { return player }

      return newPlayer.isBurst() ? newPlayer.removeBet() : newPlayer
    })

    this.setState({ deck: newDeck, chip: chip, players: newPlayers })

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
          progress: this.state.progress.finish(),
        })
      }
    }

    this.stayAction(newDeck, dealer, newPlayers, this.state.currentPlayerIndex)
  }

  stayAction(deck, dealer, players, currentPlayerIndex) {
    if (currentPlayerIndex < (players.length - 1)) {
      return this.setState({ currentPlayerIndex: currentPlayerIndex + 1 })
    }

    if (dealer.isMustHit()) {
      const [newCard, newDeck] = deck.drawCard()
      const newDealer = dealer.addCard(newCard)

      this.setState({ deck: newDeck, dealer: newDealer })

      if (newDealer.isBurst()) {
        return this.setState({
          progress: this.state.progress.finish(),
          players: players.map((player) => {
            return player.addReward()
          })
        })
      }

      return this.stayAction(newDeck, newDealer, players, currentPlayerIndex)
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
      progress: this.state.progress.finish(),
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
            <div className="dealer-score">Dealer: { this.state.progress.isFinish() ? dealer.score.value() : '---' }</div>
            <HandCards role="dealer-hand" cards={dealer.displayHand()} />
          </div>
          <PlayerField
            players={displayPlayers}
            currentPlayer={currentPlayer}
          />
          <ActionButtons
            progress={this.state.progress}
            currentPlayer={currentPlayer}
            betAction={
              () => this.setState(
                {
                  chip: this.state.chip - 50,
                  players: [currentPlayer.addBet(50)]
                }
              )
            }
            startAction={
              () => {
                this.setState(this.setup(this.state.deck, this.state.chip, currentPlayer))
              }
            }
            hitAction={
              () => this.hitAction(currentPlayer, dealer)
            }
            doubleAction={
              () => this.doubleAction(currentPlayer, dealer)
            }
            splitAction={
              () => {this.splitAction(currentPlayer)}
            }
            stayAction={
              () => {
                this.stayAction(
                  this.state.deck, dealer, this.state.players, this.state.currentPlayerIndex
                )
              }
            }
            restartAction={
              () => {
                const playersChip = this.state.players.reduce((sum, player) => {
                  return (sum + player.totalReturnAmount())
                }, this.state.chip)
                this.setState(this.setup(new Deck(), playersChip, new Player()))
              }
            }
          />
        </div>
      </div>
    )
  }
}

root.render(<Game />);
