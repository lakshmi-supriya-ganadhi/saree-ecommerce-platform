import "server-only";
import { cookies } from "next/headers";
import type { User } from "./types";
import { signSession, verifySession } from "./session";

export const SESSION_COOKIE = "saree_session";

// Seeded users. In a real app these live in a DB with hashed passwords.
// Demo credentials are shown on the login page for convenience.
const USERS: (User & { password: string })[] = [
  {
    id: "u1",
    name: "Priya",
    email: "demo@saree.shop",
    password: "saree123",
  },
  {
    id: "u2",
    name: "Admin",
    email: "admin@saree.shop",
    password: "admin123",
  },
];

/** Validate credentials. Returns the user (without password) or null. */
export function authenticate(email: string, password: string): User | null {
  const match = USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim(),
  );
  if (!match || match.password !== password) return null;
  const { password: _pw, ...user } = match;
  return user;
}

/** Read the current user from the session cookie, or null if signed out. */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const userId = verifySession(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const match = USERS.find((u) => u.id === userId);
  if (!match) return null;
  const { password: _pw, ...user } = match;
  return user;
}

/** Write the session cookie for a user (called from a server action). */
export async function createSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/** Clear the session cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
