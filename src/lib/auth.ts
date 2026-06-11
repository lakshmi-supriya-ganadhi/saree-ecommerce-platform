import "server-only";
import { cookies } from "next/headers";
import type { User } from "./types";
import { signSession, verifySession } from "./session";

export const SESSION_COOKIE = "saree_session";

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

/**
 * Register a new user at runtime (in-memory only — resets on server restart).
 * Returns the new user or null if the email is already taken.
 */
export function registerUser(
  name: string,
  email: string,
  password: string,
): User | null {
  const normalised = email.toLowerCase().trim();
  if (USERS.find((u) => u.email === normalised)) return null;
  const newUser = {
    id: `u${USERS.length + 1}`,
    name: name.trim(),
    email: normalised,
    password,
  };
  USERS.push(newUser);
  const { password: _pw, ...user } = newUser;
  return user;
}

/** Update a user's display name in-memory. Returns false if userId not found. */
export function updateUserName(userId: string, name: string): boolean {
  const match = USERS.find((u) => u.id === userId);
  if (!match) return false;
  match.name = name.trim();
  return true;
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
    maxAge: 60 * 60 * 24 * 7,
  });
}

/** Clear the session cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
