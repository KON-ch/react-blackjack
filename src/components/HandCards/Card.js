import React from "react";
import "./Card.css"

export class Card extends React.Component {
  render() {
    const card =  this.props.card

    return(
      <span className={card.suit}>
        { String.fromCodePoint(card.displayCode) }
      </span>
    )
  }
}
