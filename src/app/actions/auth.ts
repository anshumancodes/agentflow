"use server";

import bcrypt from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { SignupSchema } from "@/validators/auth";
import { signIn } from "@/lib/auth";
import type { ActionState } from "@/types";

/** Sign up a new user */
export async function signupAction(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = SignupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password } = parsed.data;

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    return { errors: { email: ["An account with this email already exists."] } };
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({ name, email, password: hashed });

  // Auto sign-in after registration
  await signIn("credentials", { email, password, redirectTo: "/dashboard" });

  return { success: true, message: "Account created successfully." };
}

/** Wrap signIn for use in login forms */
export async function loginAction(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { errors: { email: ["Invalid email or password."] } };
  }
}
