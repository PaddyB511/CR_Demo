import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Auth0Provider } from "@auth0/auth0-react";

import LoginButton from "./components/Login.tsx";
import LogoutButton from "./components/Logout.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-nx8affvie0a38544.eu.auth0.com"
      clientId="898hIqeuvUaKJUbMvTJTNUhJYMD0gA7G"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://cr/api/",
      }}
    >
      <LoginButton />
      <App />
      <LogoutButton />
    </Auth0Provider>
  </StrictMode>
);
