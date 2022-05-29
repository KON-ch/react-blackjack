import React from "react";
import './Field.css'
import { Chip } from "../Chip";
import { HandCards } from "../HandCards";

export class Field extends React.Component {
  render() {
    const player = this.props.player

    return (
      <div className={`player-field ${this.props.currentField}`}>
        <div className="player-score">
          Player: { player.score.value() }
        </div>
        <HandCards
          role="player-hand"
          cards={player.displayHand()}
          deck={this.props.deck}
        />
        <div className="player-chips">
          <Chip chip={player.rewardAmount()} role="reward-chip" />
          <Chip chip={player.betAmount()} role="player-bet" />
          <Chip chip={player.doubleDownAmount()} role="double-down-bet" />
        </div>
      </div>
    )
  }
}
