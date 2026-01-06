// UI = f(state, props)
// rendering is the process react transform state and props in visible UI.
// when state changes UI changes. rendering links these 2 things. React updates only what is changed recalculating logically the entire UI (this is the renderinge )
// useEffect is used to run some code after the page has been showed, it's used to do things outside the rendering.

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

async function exchangeCodeForJWT(code: string) {
  const tokenEndpoint =
    "https://ai-coach-user-pool-login.auth.eu-west-2.amazoncognito.com/oauth2/token";

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "2g9rugh4u5nhuaer56ft2okm0",
    code,
    redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI || "http://localhost:3000/callback",
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.json();
}

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");

  useEffect(() => {
    const storedState = sessionStorage.getItem("oauth_state");

    if (!code) {
      console.error("Missing authorisation code");
      return;
    }

    if (!returnedState || !storedState) {
      console.error("State is missing");
      return;
    }

    if (returnedState !== storedState) {
      console.error("Invalid state");
      return;
    }

    sessionStorage.removeItem("oauth_state");
    console.log("State validated successfully");
    console.log("Authorisation code:", code);

    exchangeCodeForJWT(code)
      .then((tokens) => {
        console.log("TOKENS FROM COGNITO:", tokens);

        if (tokens?.id_token) localStorage.setItem("id_token", tokens.id_token);
        if (tokens?.access_token) localStorage.setItem("access_token", tokens.access_token);
        if (tokens?.refresh_token) localStorage.setItem("refresh_token", tokens.refresh_token);

        router.replace("/home");
      })
      .catch((err) => {
        console.error("Token exchange failed:", err);
      });
  }, [code, returnedState, router]);

  return (
    <div>
      <h1>Authenticating...</h1>
    </div>
  );
}
