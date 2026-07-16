// main.jsx — entry point with correct CSS import order (per KI pattern)

// 1. Design tokens / CSS custom properties — MUST be first
import "./styles/tokens.css";

// 2. Global styles (resets, typography, glassmorphism utils, animations)
import "./styles/globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
