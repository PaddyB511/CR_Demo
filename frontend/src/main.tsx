import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Auth0Provider } from "@auth0/auth0-react";

import LoginButton from "./components/Login.tsx";
import LogoutButton from "./components/Logout.tsx";

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

const missingEnvKeys = Object.entries({
  VITE_AUTH0_DOMAIN: domain,
  VITE_AUTH0_CLIENT_ID: clientId,
  VITE_AUTH0_AUDIENCE: audience,
})
  .filter(([, value]) => !value)
  .map(([key]) => key);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element");
}

const root = createRoot(rootElement);

if (missingEnvKeys.length > 0) {
  const message =
    "Missing Auth0 configuration: " +
    missingEnvKeys.join(", ") +
    ". Define these variables in your Vite environment file (for example, .env.local).";

  console.error(message);

  root.render(
    <StrictMode>
      <main className="p-6 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Auth0 configuration required</h1>
        <p>{message}</p>
        <div className="space-y-2">
          <p>
            Use the Domain and Client ID from your Auth0 application's <strong>Basic Information</strong>
            page, and set <code>VITE_AUTH0_AUDIENCE</code> to the Identifier of your Auth0 API.
          </p>
          <p>
            Example <code>.env.local</code> entries:
          </p>
          <pre className="bg-gray-100 p-3 rounded text-left inline-block">
{`VITE_AUTH0_DOMAIN=your-tenant.eu.auth0.com
VITE_AUTH0_CLIENT_ID=yourClientId
VITE_AUTH0_AUDIENCE=https://your-api-identifier/`}
          </pre>
        </div>
      </main>
    </StrictMode>
  );
} else {
  root.render(
    <StrictMode>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience,
        }}
      >
        <LoginButton />
        <App />
        <LogoutButton />
      </Auth0Provider>
    </StrictMode>
  );
}
