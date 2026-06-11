"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  authenticate,
  createSession,
  destroySession,
  registerUser,
  updateUserName,
  getCurrentUser,
} from "@/lib/auth";
import { addAddress } from "@/lib/user-store";
import type { Address } from "@/lib/types";

export type LoginState = { error?: string };
export type SignupState = { error?: string };
export type ProfileState = { error?: string; success?: boolean };
export type AddressState = { error?: string; success?: boolean };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Please enter both email and password." };
  const user = authenticate(email, password);
  if (!user) return { error: "Invalid email or password." };
  await createSession(user.id);
  redirect("/dashboard");
}

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (!name || !email || !password || !confirmPassword) return { error: "All fields are required." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  const user = registerUser(name, email, password);
  if (!user) return { error: "An account with this email already exists." };
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };
  const ok = updateUserName(user.id, name);
  if (!ok) return { error: "Could not update profile." };
  revalidatePath("/account");
  return { success: true };
}

export async function addAddressAction(
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  const fields: Omit<Address, "id"> = {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    street: String(formData.get("street") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    pincode: String(formData.get("pincode") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
  };
  if (Object.values(fields).some((v) => !v)) return { error: "All fields are required." };
  addAddress(user.id, { id: `addr-${user.id}-${Date.now()}`, ...fields });
  revalidatePath("/account");
  return { success: true };
}
