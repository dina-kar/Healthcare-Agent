import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

// Export commonly used functions for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
