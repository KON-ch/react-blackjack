import React from "react";
import './index.css'

export class Button extends React.Component {
  render() {
    return(
      <button
        className="button"
        disabled={this.props.disabled}
        onClick={this.props.onClick}
      >
        {this.props.text}
      </button>
    )
  }
}
