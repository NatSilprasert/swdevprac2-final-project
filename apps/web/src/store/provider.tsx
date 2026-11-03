"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/store";
import { hydrate } from "@/store/slices/authSlice";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // One store per client; created lazily so SSR requests never share state.
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    storeRef.current?.dispatch(hydrate());
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
