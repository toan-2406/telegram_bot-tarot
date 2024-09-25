import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LoadingProvider } from "./contexts/loading.context.tsx";
import LoadingScreen from "./components/loading-screen";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoadingProvider>
      <LoadingScreen />
      <App />
    </LoadingProvider>
  </StrictMode>
);
