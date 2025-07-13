import { createRoot } from "react-dom/client";
import "./lib/i18n"; // Initialize i18n before App
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
