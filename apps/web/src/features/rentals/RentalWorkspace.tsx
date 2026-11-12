"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Package, Pencil, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Modal } from "@/components/ui/modal";
import { DateRangeFields } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { assetTag, formatDate, toDateInput } from "@/lib/format";
import { useAppSelector } from "@/store/hooks";
import type { Rental, RentalInput } from "@/types/rental";
import type { Equipment } from "@/types/equipment";

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
    if (!window.confirm("Delete this rental request? This cannot be undone")) return;
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

  if (!hydrated) return <div className="skeleton h-64" />;
  if (!user)
    return (
      <div className="empty-state">
        <Package size={28} strokeWidth={1.5} />
        <p className="mt-3 font-medium text-foreground">Log in to see your rentals</p>
        <Link href="/login" className="link mt-3 text-sm">
          Log in
        </Link>
      </div>
    );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="rise-in space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="page-title">
            {user.role === "admin" ? "All rental requests" : "My rentals"}
          </h1>
          <p className="page-lead">
            {user.role === "admin"
              ? "Review and manage requests from every member"
              : "Your upcoming and past equipment rentals"}
          </p>
        </div>
        <span className="num text-sm text-muted-foreground">
          {rentals.length} {rentals.length === 1 ? "request" : "requests"}
        </span>
      </div>
      {error && <p className="notice-error">{error}</p>}
      {loading ? (
        <div className="skeleton h-60" />
      ) : rentals.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={28} strokeWidth={1.5} />
          <p className="mt-3 font-medium text-foreground">No rental requests yet</p>
          <Link href="/" className="link mt-3 text-sm">
            Browse equipment
          </Link>
        </div>
      ) : (
        <div className="surface divide-y">
          {rentals.map((rental) => (
            <article
              key={rental._id}
              className="p-4 sm:flex sm:items-center sm:justify-between sm:gap-5"
            >
              <div className="min-w-0">
                <div className="flex items-baseline gap-3">
                  <h2 className="truncate font-medium">
                    {rental.equipment?.name ?? "Equipment removed"}
                  </h2>
                  {rental.equipment && (
                    <span className="asset-tag">{assetTag(rental.equipment)}</span>
                  )}
                </div>
                <p className="num mt-1 text-sm text-muted-foreground">
                  {rental.quantity} {rental.quantity === 1 ? "unit" : "units"} ·{" "}
                  {formatDate(rental.startDate)} to {formatDate(rental.returnDate)}
                </p>
                <p className="num mt-1 text-xs text-muted-foreground">
                  Requested {formatDate(rental.createdAt)}
                  {user.role === "admin" && ` · ${rental.user?.name} (${rental.user?.email})`}
                </p>
              </div>
              <div className="mt-3 flex shrink-0 items-center gap-2 sm:mt-0">
                <button className="soft-button" onClick={() => setEditing(rental)}>
                  <Pencil size={16} strokeWidth={1.5} /> Edit
                </button>
                <button
                  aria-label="Delete rental request"
                  className="soft-button text-destructive"
                  onClick={() => remove(rental._id)}
                >
                  <Trash2 size={16} strokeWidth={1.5} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && (
        <Modal title="Edit rental" onClose={() => setEditing(null)}>
          <form onSubmit={save} className="mt-5 space-y-4">
            <div>
              <label className="form-label" htmlFor="edit-equipment">
                Equipment
              </label>
              <Select
                id="edit-equipment"
                name="equipment"
                defaultValue={editing.equipment?._id}
                options={equipment.map((item) => ({
                  value: item._id,
                  label: `${item.name} · ${item.quantity} available`,
                }))}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="edit-quantity">
                Quantity (1 to 3)
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
            <DateRangeFields
              idPrefix="edit"
              min={today}
              defaultStart={toDateInput(editing.startDate)}
              defaultReturn={toDateInput(editing.returnDate)}
            />
            <p className="text-xs text-muted-foreground">
              Start today or later. Up to 7 days per rental
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="soft-button h-10" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="action-button" disabled={saving}>
                {saving ? "Saving" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
