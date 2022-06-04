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
          disabled={!progress.isSetup() || this.props.chipIsInsufficient}
          action={this.props.betAction}
        />
        <Button
          text="Start"
          disabled={!currentPlayer.hasBet() || !progress.isSetup()}
          action={this.props.startAction}
        />
        <Button
          text="Hit"
          disabled={progress.isSetup() || progress.isFinish()}
          action={this.props.hitAction}
        />
        <Button
          text="Double"
          disabled={progress.isSetup() || progress.isFinish() || this.props.chipIsInsufficient}
          action={this.props.doubleAction}
        />
        <Button
          text="Split"
          disabled={(progress.isFinish() || !currentPlayer.isSplitEnable())}
          action={this.props.splitAction}
        />
        <Button
          text="Stay"
          disabled={progress.isSetup() || progress.isFinish()}
          action={this.props.stayAction}
        />
        <Button
          text="Restart"
          disabled={!progress.isFinish()}
          action={this.props.restartAction}
        />
      </div>
    )
  }
}
