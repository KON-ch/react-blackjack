import React from "react";

export class HandCards extends React.Component {
  render() {
    return this.props.cards.map((card) => {
      return(
        <span style={{ color: this.props.deck.suitColor(card) }} key={card.displayCode}>
          { String.fromCodePoint(card.displayCode) }
        </span>
      )
    })
  }
}
