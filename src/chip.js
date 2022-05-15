import React from "react";
import './chip.css'

export class Chip extends React.Component {
  render() {
    const chip = this.props.chip

    if (chip === 0) { return }

    return (
      <div className={`chip ${this.props.role}`}>
        <span className="point">
          { chip }
        </span>
      </div>
    )
  }
}
