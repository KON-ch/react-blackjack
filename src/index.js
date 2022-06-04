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
        currentPlayerIndex: 0,
        message: 'Game start'
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
        message: 'Game finish'
      }
    }

    // 4. game start
    return {
      deck: startDeck,
      dealer: dealer,
      chip: chip,
      progress: progress.next(),
      players: [startPlayer],
      currentPlayerIndex: 0,
      message: `Player ${playerCards[0].number} ${playerCards[0].suit} and ${playerCards[1].number} ${playerCards[1].suit}`
    }
  }

  constructor(props) {
    super(props);

    this.state = { log: [this.setup(new Deck(), 1000, new Player())], current: 0 }
  }

  hitAction(currentPlayer, dealer) {
    const currentState = this.state.log[this.state.current]

    const [newCard, newDeck] = currentState.deck.drawCard()
    const newPlayer = currentPlayer.addCard(newCard)

    const newPlayers = currentState.players.map((player) => {
      if (player !== currentPlayer) {
        return player
      }
      return newPlayer.isBurst() ? newPlayer.removeBet() : newPlayer
    })

    if(newPlayer.isBurst()) {
      if (currentState.currentPlayerIndex < (currentState.players.length - 1)) {
        return this.setState(
          {
            log: this.state.log.slice(0, this.state.current + 1).concat(
              {
                ...currentState,
                ...{
                  deck: newDeck,
                  players: newPlayers,
                  currentPlayerIndex: currentState.currentPlayerIndex + 1,
                  message: `Added ${newCard.number} ${newCard.suit}`,
                }
              }
            ),
            current: this.state.current + 1
          }
        )
      }

      if (newPlayers.every((player) => { return (!player.hasBet()) })) {
        return this.setState(
          {
            log: this.state.log.slice(0, this.state.current + 1).concat(
              [
                {
                  ...currentState,
                  ...{ deck: newDeck, players: newPlayers, message: `Added ${newCard.number} ${newCard.suit}` }
                },
                {
                  ...currentState,
                  ...{
                    deck: newDeck,
                    players: newPlayers,
                    dealer: dealer.cardFaceUp(),
                    progress: currentState.progress.finish(),
                    message: `Game finish`
                  }
                }
              ]
            ),
            current: this.state.current + 2
          }
        )
      }

      this.stayAction(newDeck, dealer, newPlayers, currentState.currentPlayerIndex)
    }

    this.setState(
      {
        log: this.state.log.slice(0, this.state.current + 1).concat(
          {
            ...currentState,
            ...{ deck: newDeck, players: newPlayers, message: `Added ${newCard.number} ${newCard.suit}` }
          }
        ),
        current: this.state.current + 1
      }
    )
  }

  splitAction(currentPlayer) {
    const currentState = this.state.log[this.state.current]
    const  newPlayers = currentState.players.map((player) => {
      if(player !== currentPlayer) { return player }

      return player.splitHand()
    }).flat()

    if (!currentPlayer.isTwoAce()) {
      return this.setState({
        log: this.state.log.slice(0, this.state.current + 1).concat(
          {
            ...currentState,
            ...{
              players: newPlayers,
              chip: currentState.chip - currentPlayer.betAmount(),
              message: 'Player split hand'
            }
          }
        ),
        current: this.state.current + 1
      })
    }

    const [addCard1, deck1] = currentState.deck.drawCard()
    const [addCard2, newDeck] = deck1.drawCard()

    const addCards = [addCard1, addCard2]
    let addCounter = -1

    const finishPlayers = newPlayers.map((player) => {
      if (player.hand.cards.length !== 1) { return player }

      return player.addCard(addCards[addCounter += 1])
    })

    this.stayAction(newDeck, currentState.dealer, finishPlayers, finishPlayers.length)
  }

  async doubleAction(currentPlayer, dealer) {
    const currentState = this.state.log[this.state.current]

    const doubleDownPlayer = currentPlayer.doubleDown()
    const chip = currentState.chip - doubleDownPlayer.betAmount()

    const [newCard, newDeck] = currentState.deck.drawCard()
    const newPlayer = doubleDownPlayer.addCard(newCard)

    const newPlayers = currentState.players.map((player) => {
      if (player !== currentPlayer) { return player }

      return newPlayer.isBurst() ? newPlayer.removeBet() : newPlayer
    })

    if(newPlayer.isBurst()) {
      if (currentState.currentPlayerIndex < (currentState.players.length - 1)) {
        return this.setState(
          {
            log: this.state.log.slice(0, this.state.current + 1).concat(
              {
                ...currentState,
                ...{
                  deck: newDeck,
                  chip: chip,
                  players: newPlayers,
                  currentPlayerIndex: currentState.currentPlayerIndex + 1,
                  message: `Added bet ${doubleDownPlayer.betAmount()} points and ${newCard.number} ${newCard.suit}`
                }
              }
            ),
            current: this.state.current + 1
          }
        )
      }

      if (newPlayers.every((player) => { return (!player.hasBet()) })) {
        return this.setState(
          {
            log: this.state.log.slice(0, this.state.current + 1).concat(
              [
                {
                  ...currentState,
                  ...{
                    deck: newDeck,
                    chip: chip,
                    players: newPlayers,
                    message: `Added bet ${doubleDownPlayer.betAmount()} points and ${newCard.number} ${newCard.suit}`
                  }
                },
                {
                  ...currentState,
                  ...{
                    dealer: dealer.cardFaceUp(),
                    progress: currentState.progress.finish(),
                    deck: newDeck,
                    chip: chip,
                    players: newPlayers,
                    message: 'Game finish'
                  }
                }
              ]
            ),
            current: this.state.current + 2
          }
        )
      }
    }

    this.setState(
      {
        log: this.state.log.slice(0, this.state.current + 1).concat(
          {
            ...currentState,
            ...{
              deck: newDeck,
              chip: chip,
              players: newPlayers,
              message: `Added bet ${doubleDownPlayer.betAmount()} points and ${newCard.number} ${newCard.suit}`
            }
          }
        ),
        current: this.state.current + 1
      }
    )

    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await _sleep(300);

    this.stayAction(newDeck, dealer, newPlayers, currentState.currentPlayerIndex)
  }

  stayAction(deck, dealer, players, currentPlayerIndex) {
    const currentState = this.state.log[this.state.current]

    if (currentPlayerIndex < (players.length - 1)) {
      return this.setState(
        {
          log: this.state.log.slice(0, this.state.current + 1).concat(
            {
              ...currentState,
              ...{ currentPlayerIndex: currentPlayerIndex + 1, message: 'next player turn' }
            }
          ),
          current: this.state.current + 1
        }
      )
    }

    if (dealer.isMustHit()) {
      const [newCard, newDeck] = deck.drawCard()
      const newDealer = dealer.addCard(newCard)

      if (newDealer.isBurst()) {
        return this.setState(
          {
            log: this.state.log.slice(0, this.state.current + 1).concat(
              {
                ...currentState,
                ...{
                  deck: newDeck,
                  dealer: newDealer,
                  progress: currentState.progress.finish(),
                  players: players.map((player) => {
                    return player.addReward()
                  }),
                  message: 'Game finish'
                }
              }
            ),
            current: this.state.current + 1
          }
        )
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

    this.setState(
      {
        log: this.state.log.slice(0, this.state.current + 1).concat(
          {
            ...currentState,
            ...{
              deck: deck,
              dealer: dealer.cardFaceUp(),
              progress: currentState.progress.finish(),
              players: evaluatedPlayers,
              message: 'Game finish'
            }
          }
        ),
        current: this.state.current + 1
      }
    )
  }

  render() {
    const currentState = this.state.log[this.state.current]

    // Dealer
    const dealer = currentState.dealer

    // Player
    const currentPlayer = currentState.players[currentState.currentPlayerIndex]
    // 右側のプレイヤーからアクションを行う為、表示順を反転している
    const displayPlayers = [...currentState.players].reverse()

    return (
      <div className="game">
        <Chip chip={currentState.chip} role="game-chip" />
        <div className="game-board">
          <div className="dealer">
            <div className="dealer-score">Dealer: { currentState.progress.isFinish() ? dealer.score.value() : '---' }</div>
            <HandCards role="dealer-hand" cards={dealer.displayHand()} />
          </div>
          <PlayerField
            players={displayPlayers}
            currentPlayer={currentPlayer}
          />
          <ActionButtons
            progress={currentState.progress}
            currentPlayer={currentPlayer}
            betAction={
              () => this.setState(
                {
                  log: this.state.log.slice(0, this.state.current + 1).concat(
                    {
                      ...currentState,
                      ...{ chip: currentState.chip - 50, players: [currentPlayer.addBet(50)], message: 'Added bet 50 points' }
                    }
                  ),
                  current: this.state.current + 1
                }
              )
            }
            startAction={
              () => {
                this.setState(
                  {
                    log: this.state.log.slice(0, this.state.current + 1).concat(this.setup(currentState.deck, currentState.chip, currentPlayer)),
                    current: this.state.current + 1
                  }
                )
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
                  currentState.deck, dealer, currentState.players, currentState.currentPlayerIndex
                )
              }
            }
            restartAction={
              () => {
                const playersChip = currentState.players.reduce((sum, player) => {
                  return (sum + player.totalReturnAmount())
                }, currentState.chip)
                this.setState(
                  {
                    log: [this.setup(new Deck(), playersChip, new Player())],
                    current: 0
                  }
                )
              }
            }
          />
        </div>
        <div className="game-log">
          <span>Game Log</span>
          {
            this.state.log.map((log, index) => {
              return (
                <button
                  className="message"
                  key={index}
                  onClick={
                    () => { this.setState( { current: index }) }
                  }
                >
                  {index}. {log.message}
                </button>
              )
            })
          }
        </div>
      </div>
    )
  }
}

root.render(<Game />);
