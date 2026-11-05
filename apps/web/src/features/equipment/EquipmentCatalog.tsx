"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Camera, Dumbbell, Laptop, Search, ShieldCheck, Boxes } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAppSelector } from "@/store/hooks";
import type { Equipment } from "@/types/equipment";

const categoryIcons: Record<string, typeof Camera> = {
  camera: Camera,
  sports: Dumbbell,
  notebook: Laptop,
};

export function EquipmentCatalog() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All equipment");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, hydrated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    apiClient
      .get<Equipment[]>("/equipment")
      .then(setItems)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["All equipment", ...Array.from(new Set(items.map((item) => item.category))).sort()],
    [items]
  );
  const filtered = items.filter((item) => {
    const matchesCategory = category === "All equipment" || item.category === category;
    const matchesQuery = `${item.name} ${item.category} ${item.description}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-12 pb-12">
      <section className="hero-panel relative overflow-hidden rounded-[2rem] px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="hero-orb" />
        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
            <span className="h-2 w-2 rounded-full bg-emerald-300" /> EQUIPMENT RENTAL, MADE EASY
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            The right gear for <span className="text-emerald-300">what&apos;s next.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            Find cameras, computers, and sports equipment. Choose your dates and send a rental
            request in just a few steps.
          </p>
          <a
            href="#catalog"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Explore equipment <ArrowRight size={16} />
          </a>
        </div>
        <div className="hero-decoration" aria-hidden="true">
          <Boxes size={170} strokeWidth={0.7} />
        </div>
        <div className="absolute bottom-8 right-10 hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur sm:flex">
          <ShieldCheck size={18} className="text-emerald-300" /> Simple, transparent daily rates
        </div>
      </section>

      <section id="catalog" className="scroll-mt-8">
        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Browse the collection</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Available equipment</h2>
            <p className="mt-2 text-sm text-slate-500">
              Pick what you need. We&apos;ll take care of the rest.
            </p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search equipment..."
              className="field-input pl-11"
              aria-label="Search equipment"
            />
          </label>
        </div>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${category === item ? "bg-slate-950 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
            >
              {item}
            </button>
          ))}
        </div>
        {error && <p className="notice-error">{error}. Check that the API server is running.</p>}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-72 animate-pulse rounded-3xl bg-slate-100" />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, index) => {
              const Icon = categoryIcons[item.category.toLowerCase()] ?? Boxes;
              return (
                <article
                  key={item._id}
                  className="equipment-card group overflow-hidden rounded-3xl border border-slate-200/80 bg-white"
                >
                  <div className={`equipment-art art-${index % 3}`}>
                    <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      {item.category}
                    </span>
                    <Icon className="equipment-icon" size={68} strokeWidth={1.1} />
                    <span className="absolute bottom-5 right-5 text-xs font-semibold text-slate-500">
                      EQUIP / {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight">{item.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {item.quantity} available
                      </span>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <p>
                        <span className="text-lg font-semibold">
                          ฿{item.rentalRate.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500"> / day</span>
                      </p>
                      {hydrated && user?.role === "member" ? (
                        <Link
                          href={`/equipment/${item._id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          Rent item <ArrowRight size={15} />
                        </Link>
                      ) : user?.role === "admin" ? (
                        <Link
                          href="/admin"
                          className="text-sm font-semibold text-slate-700 hover:text-emerald-700"
                        >
                          Manage
                        </Link>
                      ) : (
                        <Link
                          href="/login"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          Sign in to rent <ArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Boxes size={32} />
            <p className="mt-3 font-medium">No equipment found</p>
            <p className="mt-1 text-sm">Try a different search or category.</p>
          </div>
        )}
      </section>
    </div>
  );
}
