"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Boxes, Camera, Dumbbell, Heart, Laptop, Search } from "lucide-react";
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

export function EquipmentCatalog({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const [items, setItems] = useState<Equipment[]>([]);
  const [savedList, setSavedList] = useState<{ ownerId: string | null; ids: string[] }>({
    ownerId: null,
    ids: [],
  });
  const [savedLoaded, setSavedLoaded] = useState(false);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [sort, setSort] = useState("name");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedError, setSavedError] = useState("");
  const { user, hydrated } = useAppSelector((state) => state.auth);
  const userId = user?.id;
  const savedIds = savedList.ownerId === userId ? savedList.ids : [];

  useEffect(() => {
    if (!hydrated) return;
    if (!userId) {
      setSavedList({ ownerId: null, ids: [] });
      setSavedLoaded(true);
      return;
    }

    let active = true;
    setSavedLoaded(false);
    setSavedError("");
    apiClient
      .get<Equipment[]>("/saved-equipment")
      .then((saved) => {
        if (active) setSavedList({ ownerId: userId, ids: saved.map((item) => item._id) });
      })
      .catch((reason: Error) => {
        if (active) {
          setSavedList({ ownerId: userId, ids: [] });
          setSavedError(reason.message);
        }
      })
      .finally(() => {
        if (active) setSavedLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [hydrated, userId]);

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
  const filtered = items
    .filter((item) => {
      const matchesCategory = category === ALL || item.category === category;
      const matchesQuery = `${item.name} ${item.category} ${item.description}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesSaved = !favoritesOnly || savedIds.includes(item._id);
      return (
        matchesCategory && matchesQuery && matchesSaved && (!availableOnly || item.quantity > 0)
      );
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.rentalRate - b.rentalRate || a.name.localeCompare(b.name);
      if (sort === "price-desc") return b.rentalRate - a.rentalRate || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });

  async function toggleSaved(item: Equipment) {
    if (!userId || savingIds.includes(item._id)) return;
    const isSaved = savedIds.includes(item._id);
    setSavingIds((ids) => [...ids, item._id]);
    setSavedError("");
    try {
      if (isSaved) {
        await apiClient.delete(`/saved-equipment/${item._id}`);
        setSavedList((current) => ({
          ownerId: userId,
          ids: current.ownerId === userId ? current.ids.filter((id) => id !== item._id) : [],
        }));
      } else {
        await apiClient.post(`/saved-equipment/${item._id}`);
        setSavedList((current) => ({
          ownerId: userId,
          ids: current.ownerId === userId ? [...new Set([...current.ids, item._id])] : [item._id],
        }));
      }
    } catch (reason) {
      setSavedError((reason as Error).message);
    } finally {
      setSavingIds((ids) => ids.filter((id) => id !== item._id));
    }
  }

  if (favoritesOnly && !hydrated) return <div className="skeleton h-64" />;
  if (favoritesOnly && !user)
    return (
      <div className="empty-state">
        <Heart size={28} strokeWidth={1.5} />
        <p className="mt-3 font-medium text-foreground">Log in to see your saved equipment</p>
        <Link href="/login" className="link mt-3 text-sm">
          Log in
        </Link>
      </div>
    );

  return (
    <div className="pb-12">
      <section>
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="page-title">
              {favoritesOnly ? "Saved equipment" : "Available equipment"}
            </h1>
            {favoritesOnly && <p className="page-lead">Saved items for your account</p>}
          </div>
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
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(event) => setAvailableOnly(event.target.checked)}
              className="h-4 w-4 accent-emerald-700"
            />
            Available now
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </span>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sort by</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="form-control h-9 w-auto min-w-36"
                aria-label="Sort equipment"
              >
                <option value="name">Name</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>
        {error && (
          <p className="notice-error mb-4">{error}. Check that the API server is running</p>
        )}
        {savedError && <p className="notice-error mb-4">{savedError}</p>}
        {loading || (favoritesOnly && (!savedLoaded || savedList.ownerId !== userId)) ? (
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
                    {hydrated && user ? (
                      <button
                        type="button"
                        aria-label={
                          savedIds.includes(item._id)
                            ? `Remove ${item.name} from saved`
                            : `Save ${item.name}`
                        }
                        aria-pressed={savedIds.includes(item._id)}
                        disabled={
                          !savedLoaded ||
                          savedList.ownerId !== userId ||
                          savingIds.includes(item._id)
                        }
                        onClick={() => toggleSaved(item)}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-muted-foreground transition-colors hover:text-rose-600 disabled:opacity-50"
                      >
                        <Heart
                          size={16}
                          strokeWidth={1.75}
                          fill={savedIds.includes(item._id) ? "currentColor" : "none"}
                          className={savedIds.includes(item._id) ? "text-rose-600" : ""}
                        />
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        aria-label={`Sign in to save ${item.name}`}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-muted-foreground transition-colors hover:text-rose-600"
                      >
                        <Heart size={16} strokeWidth={1.75} />
                      </Link>
                    )}
                    <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
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
            <p className="mt-3 font-medium text-foreground">
              {favoritesOnly && savedLoaded && savedIds.length === 0
                ? "No saved equipment yet"
                : "No equipment found"}
            </p>
            <p className="mt-1 text-sm">
              {favoritesOnly && savedIds.length === 0
                ? "Save items from the catalogue with the heart button"
                : "Try a different search or category"}
            </p>
            {favoritesOnly && savedIds.length === 0 && (
              <Link href="/" className="link mt-3 text-sm">
                Browse equipment
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
