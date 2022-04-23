import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container)

class Game extends React.Component {
  randomNumber(totalCount) {
    return (
      Math.floor(Math.random() * totalCount - 1) + 1
    )
  }

  setup() {
    const deck = [
      { 11: 127137 }, { 2: 127138 }, { 3: 127139 }, { 4: 127140 }, { 5: 127141 }, { 6: 127142 }, { 7: 127143 }, { 8: 127144 }, { 9: 127145 }, { 10: 127146 }, { 10: 127147 }, { 10: 127149 }, { 10: 127150 },
      { 11: 127153 }, { 2: 127154 }, { 3: 127155 }, { 4: 127156 }, { 5: 127157 }, { 6: 127158 }, { 7: 127159 }, { 8: 127160 }, { 9: 127161 }, { 10: 127162 }, { 10: 127163 }, { 10: 127165 }, { 10: 127166 },
      { 11: 127169 }, { 2: 127170 }, { 3: 127171 }, { 4: 127172 }, { 5: 127173 }, { 6: 127174 }, { 7: 127175 }, { 8: 127176 }, { 9: 127177 }, { 10: 127178 }, { 10: 127179 }, { 10: 127181 }, { 10: 127182 },
      { 11: 127185 }, { 2: 127186 }, { 3: 127187 }, { 4: 127188 }, { 5: 127189 }, { 6: 127190 }, { 7: 127191 }, { 8: 127192 }, { 9: 127193 }, { 10: 127194 }, { 10: 127195 }, { 10: 127197 }, { 10: 127198 },
    ]

    let playerHand = []
    let dealerHand = []

    playerHand = playerHand.concat(deck.splice(this.randomNumber(deck.length), 1))
    dealerHand = dealerHand.concat(deck.splice(this.randomNumber(deck.length), 1))
    playerHand = playerHand.concat(deck.splice(this.randomNumber(deck.length), 1))
    dealerHand = dealerHand.concat(deck.splice(this.randomNumber(deck.length), 1))

    return {
      deck: deck,
      playerHand: playerHand,
      dealerHand: dealerHand,
    }
  }

  constructor(props) {
    super(props);
    this.state = this.setup()
  }

  render() {
    let sortDealerHand = JSON.parse(JSON.stringify(this.state.dealerHand))

    sortDealerHand.sort((a,b) => {
      const aNumber = Number(Object.keys(a))
      const bNumber = Number(Object.keys(b))
      if (aNumber > bNumber) { return 1 }
      if (aNumber < bNumber) { return -1 }
      return 0
    })

    let dealerScore = 0
    for(const hand of sortDealerHand) {
      dealerScore += Number(Object.keys(hand))

      if (Number(Object.keys(hand)) === 11 && dealerScore > 21) {
        dealerScore -= 10
      }
    }

    let sortPlayerHand = JSON.parse(JSON.stringify(this.state.playerHand))

    sortPlayerHand.sort((a,b) => {
      const aNumber = Number(Object.keys(a))
      const bNumber = Number(Object.keys(b))
      if (aNumber > bNumber) { return 1 }
      if (aNumber < bNumber) { return -1 }
      return 0
    })

    let playerScore = 0

    for(const hand of sortPlayerHand) {
      playerScore += Number(Object.keys(hand))

      if (Number(Object.keys(hand)) === 11 && playerScore > 21) {
        playerScore -= 10
      }
    }

    return (
      <div className="game">
        <div className="game-board">
          <div className="dealer">
            <div className="dealer-score">Dealer: { dealerScore }</div>
            <div className="dealer-hand">
              {
                this.state.dealerHand.map((hand) => {
                  return String.fromCodePoint(Object.values(hand))
                })
              }
            </div>
          </div>
          <div className="player">
            <div className="player-score">Player: { playerScore }</div>
            <div className="player-hand">
              {
                this.state.playerHand.map((hand) => {
                  return String.fromCodePoint(Object.values(hand))
                })
              }
            </div>
            <div className="player-action">
              <button
                className="hit-buton"
                onClick={() => this.setState({ playerHand: this.state.playerHand.concat(this.state.deck.splice(this.randomNumber(this.state.deck.length), 1)) })}
              >
                Hit
              </button>
              <button
                className="stay-button"
                onClick={() => {
                  if (dealerScore < 17) {
                    this.setState({ dealerHand: this.state.dealerHand.concat(this.state.deck.splice(this.randomNumber(this.state.deck.length), 1)) })
                  }
                }}
              >
                Stay
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

root.render(<Game />);
