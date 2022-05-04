import React from "react";
import { Card } from "./card"

export class HandCards extends React.Component {
  render() {
    return this.props.hands.map((hand) => {
      return <Card hand={hand} deck={this.props.deck} key={Object.values(hand)} />
    })
  }
}
