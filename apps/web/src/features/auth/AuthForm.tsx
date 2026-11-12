"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Select } from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, register } from "@/store/slices/authSlice";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status } = useAppSelector((state) => state.auth);
  const [formError, setFormError] = useState("");
  const isRegister = mode === "register";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const result = isRegister
      ? await dispatch(
          register({
            name: String(values.name),
            email: String(values.email),
            tel: String(values.tel),
            password: String(values.password),
            role: values.role === "admin" ? "admin" : "member",
          })
        )
      : await dispatch(login({ email: String(values.email), password: String(values.password) }));
    if (result.meta.requestStatus === "fulfilled") router.push("/");
    else
      setFormError(
        typeof result.payload === "string" ? result.payload : "Unable to sign in. Try again"
      );
  }

  return (
    <div className="surface rise-in mx-auto w-full max-w-md p-6 sm:p-8">
      <h1 className="page-title">{isRegister ? "Create account" : "Log in"}</h1>
      <p className="page-lead">
        {isRegister ? "Register to request equipment" : "Log in to manage your rentals"}
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {isRegister && (
          <div>
            <label className="form-label" htmlFor="name">
              Full name
            </label>
            <input className="form-control" id="name" name="name" autoComplete="name" required />
          </div>
        )}
        <div>
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            className="form-control"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        {isRegister && (
          <div>
            <label className="form-label" htmlFor="tel">
              Phone
            </label>
            <input
              className="form-control"
              id="tel"
              name="tel"
              type="tel"
              autoComplete="tel"
              required
            />
          </div>
        )}
        {isRegister && (
          <div>
            <label className="form-label" htmlFor="role">
              Account type
            </label>
            <Select
              id="role"
              name="role"
              defaultValue="member"
              options={[
                { value: "member", label: "Member: rent equipment" },
                { value: "admin", label: "Administrator: manage equipment and requests" },
              ]}
            />
          </div>
        )}
        <div>
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            className="form-control"
            id="password"
            name="password"
            type="password"
            minLength={6}
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
          />
          {isRegister && (
            <p className="mt-1 text-xs text-muted-foreground">At least 6 characters</p>
          )}
        </div>
        {formError && <p className="notice-error">{formError}</p>}
        <button disabled={status === "loading"} className="action-button w-full" type="submit">
          {status === "loading" ? "Please wait" : isRegister ? "Create account" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isRegister ? "Already registered? " : "No account yet? "}
        <Link className="link" href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Log in" : "Register"}
        </Link>
      </p>
    </div>
  );
}
