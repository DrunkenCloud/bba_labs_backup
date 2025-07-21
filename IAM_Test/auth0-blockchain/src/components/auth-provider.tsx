"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import type { ReactNode } from "react";

const AUTH0_DOMAIN = 'dev-3vni85xxxmyl08u3.us.auth0.com';
const AUTH0_CLIENT_ID = 'wYX9R7TekCAFJZpszlxKXphnnRwOeHUg';

export function AuthProvider({ children }: { children: ReactNode }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (!origin) {
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: origin,
        scope: "openid profile email"
      }}
    >
      {children}
    </Auth0Provider>
  );
}
