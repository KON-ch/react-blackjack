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

    const playerCard1 = deck.splice(this.randomNumber(deck.length), 1)[0]
    const dealerCard1 = deck.splice(this.randomNumber(deck.length), 1)[0]
    const playerCard2 = deck.splice(this.randomNumber(deck.length), 1)[0]
    const dealerCard2 = deck.splice(this.randomNumber(deck.length), 1)[0]

    const playerHand = Number(Object.keys(playerCard1)) + Number(Object.keys(playerCard2))
    const dealerHand = Number(Object.keys(dealerCard1)) + Number(Object.keys(dealerCard2))

    return {
      deck: deck,
      playerCard1: playerCard1,
      playerCard2: playerCard2,
      dealerCard1: dealerCard1,
      dealerCard2: dealerCard2,
      playerHand: playerHand,
      dealerHand: dealerHand,

    }
  }

  constructor(props) {
    super(props);
    this.state = this.setup()
  }

  render() {
    return (
      <div className="game">
        <div className="game-board">
          <div className="dealer">
            <div>Dealer: { this.state.dealerHand }</div>
            { String.fromCodePoint(Object.values(this.state.dealerCard1)) }
            { String.fromCodePoint(Object.values(this.state.dealerCard2)) }
          </div>
          <div className="player">
            <div>Player: { this.state.playerHand }</div>
            { String.fromCodePoint(Object.values(this.state.playerCard1)) }
            { String.fromCodePoint(Object.values(this.state.playerCard2)) }
          </div>
        </div>
      </div>
    )
  }
}

root.render(<Game />);
