import React from "react";

export class Card extends React.Component {
  displayCard(hand){
    return String.fromCodePoint(Object.values(hand))
  }

  render() {
    const hand = this.props.hand

    return (
      <span style={this.props.deck.suitColor(hand)}>
        {this.displayCard(hand)}
      </span>
    )
  }
}
