import { Buffer } from "buffer";
// Polyfill Node Buffer for browser libs (bip39, etc.)
(globalThis as unknown as { Buffer: typeof Buffer }).Buffer ||= Buffer;

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
