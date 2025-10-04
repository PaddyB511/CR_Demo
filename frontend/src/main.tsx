import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Auth0Provider } from "@auth0/auth0-react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-t3crhfr5g3mrn5sk.eu.auth0.com"
      clientId="898hIqeuvUaKJUbMvTJTNUhJYMD0gA7G"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://cr/api/",
      }}
    >
      {/* <LoginButton /> */}
      <App />
      {/* <LogoutButton /> */}
    </Auth0Provider>
  </StrictMode>
);
