import React from "react";

export class Card extends React.Component {
  render() {
    const card =  this.props.card

    return(
      <span style={{ color: this.props.color }}>
        { String.fromCodePoint(card.displayCode) }
      </span>
    )
  }
}
