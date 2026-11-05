"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Clock3, Package, Pencil, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAppSelector } from "@/store/hooks";
import type { Rental, RentalInput } from "@/types/rental";
import type { Equipment } from "@/types/equipment";

const dateValue = (value: string) => new Date(value).toISOString().slice(0, 10);

export function RentalWorkspace() {
  const { user, hydrated } = useAppSelector((state) => state.auth);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Rental | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [rows, stock] = await Promise.all([
      apiClient.get<Rental[]>("/rentals"),
      apiClient.get<Equipment[]>("/equipment"),
    ]);
    setRentals(rows);
    setEquipment(stock);
  }, []);

  useEffect(() => {
    if (!hydrated || !user) return;
    load()
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [hydrated, user, load]);

  async function remove(id: string) {
    if (!window.confirm("Delete this rental request? This cannot be undone.")) return;
    setError("");
    try {
      await apiClient.delete(`/rentals/${id}`);
      setRentals((rows) => rows.filter((row) => row._id !== id));
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const input: RentalInput = {
      equipment: String(form.get("equipment")),
      quantity: Number(form.get("quantity")),
      startDate: String(form.get("startDate")),
      returnDate: String(form.get("returnDate")),
    };
    setSaving(true);
    setError("");
    try {
      await apiClient.put(`/rentals/${editing._id}`, input);
      setEditing(null);
      await load();
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!hydrated) return <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />;
  if (!user)
    return (
      <div className="empty-state">
        <Package size={32} />
        <p className="mt-3 font-medium">Sign in to see your rentals</p>
        <Link href="/login" className="mt-3 text-sm font-semibold text-emerald-700">
          Go to sign in
        </Link>
      </div>
    );

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Rental activity</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {user.role === "admin" ? "All rental requests" : "My rentals"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {user.role === "admin"
              ? "Review and manage requests from every member."
              : "Keep track of your upcoming equipment rentals."}
          </p>
        </div>
        <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
          {rentals.length} {rentals.length === 1 ? "request" : "requests"}
        </span>
      </div>
      {error && <p className="notice-error">{error}</p>}
      {loading ? (
        <div className="h-60 animate-pulse rounded-3xl bg-slate-100" />
      ) : rentals.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={32} />
          <p className="mt-3 font-medium">No rental requests yet</p>
          <Link href="/" className="mt-3 text-sm font-semibold text-emerald-700">
            Explore equipment
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rentals.map((rental) => (
            <article
              key={rental._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-5"
            >
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                  <Package size={21} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">
                    {rental.equipment?.name ?? "Unavailable equipment"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {rental.quantity} item{rental.quantity === 1 ? "" : "s"} ·{" "}
                    {rental.equipment?.category ?? "Equipment"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={13} />
                      {dateValue(rental.startDate)} → {dateValue(rental.returnDate)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={13} />
                      Requested {dateValue(rental.createdAt)}
                    </span>
                  </div>
                  {user.role === "admin" && (
                    <p className="mt-2 text-xs text-slate-500">
                      {rental.user?.name} · {rental.user?.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex shrink-0 items-center gap-2 sm:mt-0">
                <button className="soft-button" onClick={() => setEditing(rental)}>
                  <Pencil size={14} /> Edit
                </button>
                <button
                  aria-label="Delete rental request"
                  className="soft-button !border-rose-100 !text-rose-700 hover:!bg-rose-50"
                  onClick={() => remove(rental._id)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-rental-heading"
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">Update request</p>
                <h2 id="edit-rental-heading" className="mt-1 text-xl font-semibold">
                  Edit rental dates or quantity
                </h2>
              </div>
              <button
                className="text-slate-400 hover:text-slate-700"
                onClick={() => setEditing(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <form onSubmit={save} className="mt-5 space-y-4">
              <div>
                <label className="form-label" htmlFor="edit-equipment">
                  Equipment
                </label>
                <select
                  className="form-control"
                  id="edit-equipment"
                  name="equipment"
                  defaultValue={editing.equipment?._id}
                  required
                >
                  {equipment.map((item) => (
                    <option value={item._id} key={item._id}>
                      {item.name} · {item.quantity} available
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="edit-quantity">
                  Quantity (1–3)
                </label>
                <input
                  className="form-control"
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  max={3}
                  defaultValue={editing.quantity}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label" htmlFor="edit-start">
                    Start date
                  </label>
                  <input
                    className="form-control"
                    id="edit-start"
                    name="startDate"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    defaultValue={dateValue(editing.startDate)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="edit-return">
                    Return date
                  </label>
                  <input
                    className="form-control"
                    id="edit-return"
                    name="returnDate"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    defaultValue={dateValue(editing.returnDate)}
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Start date must be today or later. Maximum rental duration is 7 days.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="soft-button" onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button className="action-button" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
