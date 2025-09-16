import './index.css';
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";   // use merged App instead of AppRouter

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
