import React from "react";
import './index.css'
import { Card } from './Card'

export class HandCards extends React.Component {
  render() {
    const handCards = this.props.cards.map((card) => {
      return (
        <Card
          card={card}
          key={card.displayCode}
        />
      )
    })

    return <div className={`hand-cards ${this.props.role}`}>{ handCards }</div>
  }
}
