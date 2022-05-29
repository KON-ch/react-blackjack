import React from "react";
import './index.css'
import { Button } from "./Button";

export class ActionButtons extends React.Component {
  render() {
    const progress = this.props.progress
    const currentPlayer = this.props.currentPlayer

    return(
      <div className="action">
        <Button
          text="Bet"
          disabled={progress !== 'setup'}
          action={this.props.betAction}
        />
        <Button
          text="Start"
          disabled={!currentPlayer.hasBet() || progress !== 'setup'}
          action={this.props.startAction}
        />
        <Button
          text="Hit"
          disabled={progress !== 'start'}
          action={this.props.hitAction}
        />
        <Button
          text="Double"
          disabled={progress !== 'start'}
          action={this.props.doubleAction}
        />
        <Button
          text="Split"
          disabled={(progress === 'finish' || !currentPlayer.isSplitEnable())}
          action={this.props.splitAction}
        />
        <Button
          text="Stay"
          disabled={progress !== 'start'}
          action={this.props.stayAction}
        />
        <Button
          text="Restart"
          disabled={progress !== 'finish'}
          action={this.props.restartAction}
        />
      </div>
    )
  }
}
