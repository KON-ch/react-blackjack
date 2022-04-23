import React from "react";
import { createRoot } from "react-dom/client";
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container)

function randomNumber(min, max) {
  const minNumber = min + 1
  const maxNumber = max + 1

  return (
    Math.floor(Math.random() * maxNumber - minNumber) + minNumber
  )
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deck: [
        { 1: 127137 }, { 2: 127138 }, { 3: 127139 }, { 4: 127140 }, { 5: 127141 }, { 6: 127142 }, { 7: 127143 }, { 8: 127144 }, { 9: 127145 }, { 10: 127146 }, { 10: 127147 }, { 10: 127149 }, { 10: 127150 },
        { 1: 127153 }, { 2: 127154 }, { 3: 127155 }, { 4: 127156 }, { 5: 127157 }, { 6: 127158 }, { 7: 127159 }, { 8: 127160 }, { 9: 127161 }, { 10: 127162 }, { 10: 127163 }, { 10: 127165 }, { 10: 127166 },
        { 1: 127169 }, { 2: 127170 }, { 3: 127171 }, { 4: 127172 }, { 5: 127173 }, { 6: 127174 }, { 7: 127175 }, { 8: 127176 }, { 9: 127177 }, { 10: 127178 }, { 10: 127179 }, { 10: 127181 }, { 10: 127182 },
        { 1: 127185 }, { 2: 127186 }, { 3: 127187 }, { 4: 127188 }, { 5: 127189 }, { 6: 127190 }, { 7: 127191 }, { 8: 127192 }, { 9: 127193 }, { 10: 127194 }, { 10: 127195 }, { 10: 127197 }, { 10: 127198 },
      ]
    }
  }

  render() {
    const playerCard1 = this.state.deck.splice(randomNumber(0, 51), 1)[0]
    const dealerCard1 = this.state.deck.splice(randomNumber(0, 51), 1)[0]
    const playerCard2 = this.state.deck.splice(randomNumber(0, 51), 1)[0]
    const dealerCard2 = this.state.deck.splice(randomNumber(0, 51), 1)[0]

    const playerHand = Number(Object.keys(playerCard1)) + Number(Object.keys(playerCard2))
    const dealerHand = Number(Object.keys(dealerCard1)) + Number(Object.keys(dealerCard2))

    return (
      <div className="game">
        <div className="game-board">
          <div className="dealer">
            <div>Dealer: { dealerHand }</div>
            { String.fromCodePoint(Object.values(dealerCard1)) }
            { String.fromCodePoint(Object.values(dealerCard2)) }
          </div>
          <div className="player">
            <div>Player: { playerHand }</div>
            { String.fromCodePoint(Object.values(playerCard1)) }
            { String.fromCodePoint(Object.values(playerCard2)) }
          </div>
        </div>
      </div>
    )
  }
}

root.render(<Game />);
