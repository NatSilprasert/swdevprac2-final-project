"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

export function Navbar() {
  const dispatch = useAppDispatch();
  const { user, hydrated } = useAppSelector((s) => s.auth);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-base font-medium tracking-tight">
          gearhouse<span className="text-brand">.</span>
        </Link>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Equipment</Link>
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
              <span className="ml-2 mr-1 hidden text-sm text-muted-foreground md:block">
                {user.name}
              </span>
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
