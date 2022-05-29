import React from "react";
import './index.css'

export class HandCards extends React.Component {
  render() {
    const handCards = this.props.cards.map((card) => {
      return(
        <span style={{ color: this.props.deck.suitColor(card) }} key={card.displayCode}>
          { String.fromCodePoint(card.displayCode) }
        </span>
      )
    })

    return <div className={`hand-cards ${this.props.role}`}>{ handCards }</div>
  }
}
