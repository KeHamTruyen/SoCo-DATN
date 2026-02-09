
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { AuthProvider } from "./contexts/AuthContext.tsx";
  import { CartProvider } from "./contexts/CartContext.tsx";

  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  );
  