"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { PackageCheck } from "lucide-react";

export function Navbar() {
  const dispatch = useAppDispatch();
  const { user, hydrated } = useAppSelector((s) => s.auth);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-emerald-300">
            <PackageCheck size={19} />
          </span>
          <span>
            gearhouse<span className="text-emerald-600">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Explore</Link>
          </Button>
          {hydrated && user ? (
            <>
              {user.role === "member" && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/rentals">My rentals</Link>
                </Button>
              )}
              {user.role === "admin" && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin">Dashboard</Link>
                </Button>
              )}
              <span className="ml-2 hidden text-sm text-slate-500 md:block">{user.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await dispatch(logout());
                  router.push("/");
                }}
              >
                Log out
              </Button>
            </>
          ) : hydrated ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full bg-slate-950 px-4 text-white hover:bg-emerald-700"
              >
                <Link href="/register">Register</Link>
              </Button>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
