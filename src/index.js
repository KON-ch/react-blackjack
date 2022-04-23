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
    const dealerScore = Number(Object.keys(this.state.dealerHand[0])) + Number(Object.keys(this.state.dealerHand[1]))
    const playerScore = Number(Object.keys(this.state.playerHand[0])) + Number(Object.keys(this.state.playerHand[1]))

    return (
      <div className="game">
        <div className="game-board">
          <div className="dealer">
            <div>Dealer: { dealerScore }</div>
            { String.fromCodePoint(Object.values(this.state.dealerHand[0])) }
            { String.fromCodePoint(Object.values(this.state.dealerHand[1])) }
          </div>
          <div className="player">
            <div>Player: { playerScore }</div>
            { String.fromCodePoint(Object.values(this.state.playerHand[0])) }
            { String.fromCodePoint(Object.values(this.state.playerHand[1])) }
          </div>
        </div>
      </div>
    )
  }
}

root.render(<Game />);
