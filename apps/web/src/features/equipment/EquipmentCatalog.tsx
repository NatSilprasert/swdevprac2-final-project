"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Boxes, Camera, Dumbbell, Laptop, Search } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { assetTag, formatBaht } from "@/lib/format";
import { useAppSelector } from "@/store/hooks";
import type { Equipment } from "@/types/equipment";

const categoryIcons: Record<string, typeof Camera> = {
  camera: Camera,
  sports: Dumbbell,
  notebook: Laptop,
};

const ALL = "All";

export function EquipmentCatalog() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
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
    () => [ALL, ...Array.from(new Set(items.map((item) => item.category))).sort()],
    [items]
  );
  const filtered = items.filter((item) => {
    const matchesCategory = category === ALL || item.category === category;
    const matchesQuery = `${item.name} ${item.category} ${item.description}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="pb-12">
      <section>
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h1 className="page-title">Available equipment</h1>
          <label className="relative block w-full sm:max-w-xs">
            <Search
              size={16}
              strokeWidth={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="form-control pl-9"
              aria-label="Search equipment"
            />
          </label>
        </div>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`h-8 whitespace-nowrap rounded-lg px-3 text-sm transition-colors duration-150 ${
                category === item
                  ? "bg-primary text-primary-foreground"
                  : "border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        {error && (
          <p className="notice-error mb-4">{error}. Check that the API server is running</p>
        )}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="skeleton h-72" />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const Icon = categoryIcons[item.category.toLowerCase()] ?? Boxes;
              const inStock = item.quantity > 0;
              return (
                <article
                  key={item._id}
                  className="surface flex flex-col overflow-hidden transition-colors duration-150 hover:border-foreground/25"
                >
                  <div className="relative m-2 flex h-36 items-center justify-center rounded-lg bg-muted">
                    <span className="asset-tag absolute left-3 top-3">{assetTag(item)}</span>
                    <span className="absolute right-3 top-3 text-xs text-muted-foreground">
                      {item.category}
                    </span>
                    <Icon size={40} strokeWidth={1.25} className="text-foreground/70" />
                  </div>
                  <div className="flex flex-1 flex-col p-4 pt-3">
                    <h3 className="text-base font-medium">{item.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="mt-3 mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`status-dot ${inStock ? "" : "status-dot-off"}`} />
                      <span className="num">
                        {inStock ? `${item.quantity} available` : "Out of stock"}
                      </span>
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t pt-4">
                      <p className="num">
                        <span className="text-base font-medium">{formatBaht(item.rentalRate)}</span>
                        <span className="text-xs text-muted-foreground"> / day</span>
                      </p>
                      {hydrated && user?.role === "member" ? (
                        <Link
                          href={`/equipment/${item._id}`}
                          className="link inline-flex items-center gap-1 text-sm"
                        >
                          Rent <ArrowRight size={14} strokeWidth={1.5} />
                        </Link>
                      ) : hydrated && user?.role === "admin" ? (
                        <Link href="/admin" className="link text-sm">
                          Manage
                        </Link>
                      ) : (
                        <Link href="/login" className="link inline-flex items-center gap-1 text-sm">
                          Sign in to rent <ArrowRight size={14} strokeWidth={1.5} />
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
            <Boxes size={28} strokeWidth={1.5} />
            <p className="mt-3 font-medium text-foreground">No equipment found</p>
            <p className="mt-1 text-sm">Try a different search or category</p>
          </div>
        )}
      </section>
    </div>
  );
}
