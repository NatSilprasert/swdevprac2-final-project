"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, PackageCheck } from "lucide-react";
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
        typeof result.payload === "string" ? result.payload : "Unable to sign in. Please try again."
      );
  }

  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 md:grid-cols-[.9fr_1.1fr]">
      <div className="hero-panel hidden flex-col justify-between p-10 text-white md:flex">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <PackageCheck size={21} className="text-emerald-300" /> gearhouse.
        </Link>
        <div>
          <p className="eyebrow !text-emerald-300">Your next project starts here</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">Good gear makes good work.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Book the equipment you need, exactly when you need it.
          </p>
        </div>
        <p className="text-xs text-slate-400">Trusted equipment. Straightforward rentals.</p>
      </div>
      <div className="p-7 sm:p-10">
        <p className="eyebrow">Welcome to gearhouse</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {isRegister
            ? "Join us and find the gear for your next big idea."
            : "Sign in to manage your equipment rentals."}
        </p>
        <form onSubmit={submit} className="mt-7 space-y-4">
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
              Email address
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
                Phone number
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
              <select className="form-control" id="role" name="role" defaultValue="member">
                <option value="member">Member — rent equipment</option>
                <option value="admin">Administrator — manage equipment and requests</option>
              </select>
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
            <p className="mt-1 text-xs text-slate-400">At least 6 characters</p>
          </div>
          {formError && <p className="notice-error">{formError}</p>}
          <button
            disabled={status === "loading"}
            className="action-button mt-2 w-full"
            type="submit"
          >
            {status === "loading" ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
            <ArrowRight size={16} />
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? "Already have an account? " : "New to gearhouse? "}
          <Link
            className="font-semibold text-emerald-700 hover:underline"
            href={isRegister ? "/login" : "/register"}
          >
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
