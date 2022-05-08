import React from "react";

export class HandCards extends React.Component {
  render() {
    return this.props.hands.map((card) => {
      return(
        <span style={{ color: this.props.deck.suitColor(card.suit) }}>
          { card.displayCode }
        </span>
      )
    })
  }
}
