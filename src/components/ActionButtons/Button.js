import React from "react";
import './Button.css'

export class Button extends React.Component {
  render() {
    return(
      <button
        className="button"
        disabled={this.props.disabled}
        onClick={this.props.action}
      >
        {this.props.text}
      </button>
    )
  }
}
