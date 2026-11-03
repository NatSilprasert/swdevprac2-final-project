"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export function Navbar() {
  const dispatch = useAppDispatch();
  const { user, hydrated } = useAppSelector((s) => s.auth);

  return (
    <header className="border-b">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          Equipment Rental
        </Link>
        <div className="flex items-center gap-2">
          {hydrated && user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.name} ({user.role})
              </span>
              <Button variant="outline" size="sm" onClick={() => dispatch(logout())}>
                Log out
              </Button>
            </>
          ) : hydrated ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
