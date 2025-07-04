"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import type { ReactNode } from "react";

const AUTH0_DOMAIN = '------';
const AUTH0_CLIENT_ID = '-----';

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
