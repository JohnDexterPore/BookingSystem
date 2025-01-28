// src/components/Button.jsx
import "./App.css"; // Optional: You can create a separate CSS file for button styles
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

function Button() {
  return (
    <button className="my-button">
      <FontAwesomeIcon icon={faEnvelope} />
      Click Me
    </button>
  );
}

export default Button;
