import React from "react";
import './index.css'
import { Field } from "./Field";

export class PlayerField extends React.Component {
  render() {
    return (
      <div className="player">
        {
          this.props.players.map((player, index) => {
            const currentField = player === this.props.currentPlayer ? 'current-field' : ''
            return (
              <Field
                currentField={currentField}
                player={player}
                deck={this.props.deck}
                key={index}
              />
            )
          })
        }
      </div>
    )
  }
}
