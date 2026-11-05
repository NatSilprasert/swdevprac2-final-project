"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Archive, Boxes, ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAppSelector } from "@/store/hooks";
import type { Equipment, EquipmentInput } from "@/types/equipment";

const empty: EquipmentInput = {
  name: "",
  category: "",
  description: "",
  quantity: 1,
  rentalRate: 0,
};

export function EquipmentAdmin() {
  const { user, hydrated } = useAppSelector((state) => state.auth);
  const [items, setItems] = useState<Equipment[]>([]);
  const [form, setForm] = useState<EquipmentInput>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(() => apiClient.get<Equipment[]>("/equipment").then(setItems), []);

  useEffect(() => {
    if (!hydrated || !user || user.role !== "admin") return;
    load()
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [hydrated, user, load]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (editing) await apiClient.put(`/equipment/${editing}`, form);
      else await apiClient.post("/equipment", form);
      await load();
      setForm(empty);
      setEditing(null);
      setNotice(editing ? "Equipment updated." : "Equipment added to the collection.");
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function edit(item: Equipment) {
    setEditing(item._id);
    setForm({
      name: item.name,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      rentalRate: item.rentalRate,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(item: Equipment) {
    if (
      !window.confirm(
        `Remove ${item.name} from the active collection? Existing rental history will remain.`
      )
    )
      return;
    setError("");
    setNotice("");
    try {
      await apiClient.delete(`/equipment/${item._id}`);
      setItems((rows) => rows.filter((row) => row._id !== item._id));
      setNotice(`${item.name} is no longer active.`);
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  if (!hydrated) return <div className="h-80 animate-pulse rounded-3xl bg-slate-100" />;
  if (!user || user.role !== "admin")
    return (
      <div className="empty-state">
        <Archive size={32} />
        <p className="mt-3 font-medium">Administrator access required</p>
        <Link className="mt-3 text-sm font-semibold text-emerald-700" href="/login">
          Sign in with an administrator account
        </Link>
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Equipment dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage the active collection and review incoming requests.
          </p>
        </div>
        <Link href="/rentals" className="soft-button w-fit">
          <ClipboardList size={16} /> View rental requests
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Active listings
          </p>
          <p className="mt-2 text-3xl font-semibold">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Total available units
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {items.reduce((total, item) => total + item.quantity, 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Rental requests
          </p>
          <Link
            href="/rentals"
            className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-emerald-700"
          >
            Review requests <ClipboardList size={17} />
          </Link>
        </div>
      </div>
      <div className="grid items-start gap-7 lg:grid-cols-[.85fr_1.15fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
              {editing ? <Pencil size={18} /> : <Plus size={19} />}
            </span>
            <div>
              <p className="eyebrow">{editing ? "Edit listing" : "New listing"}</p>
              <h2 className="font-semibold">{editing ? "Update equipment" : "Add equipment"}</h2>
            </div>
          </div>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="form-label" htmlFor="equipment-name">
                Name
              </label>
              <input
                className="form-control"
                id="equipment-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label" htmlFor="equipment-category">
                Category
              </label>
              <input
                className="form-control"
                id="equipment-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Camera, Notebook, Sports…"
                required
              />
            </div>
            <div>
              <label className="form-label" htmlFor="equipment-description">
                Description
              </label>
              <textarea
                className="form-control min-h-24 resize-y"
                id="equipment-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label" htmlFor="equipment-quantity">
                  Available quantity
                </label>
                <input
                  className="form-control"
                  id="equipment-quantity"
                  type="number"
                  min={0}
                  step={1}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="equipment-rate">
                  Rate per day (฿)
                </label>
                <input
                  className="form-control"
                  id="equipment-rate"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.rentalRate}
                  onChange={(e) => setForm({ ...form, rentalRate: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            {error && <p className="notice-error">{error}</p>}
            {notice && <p className="notice-success">{notice}</p>}
            <div className="flex gap-2">
              <button className="action-button flex-1" disabled={saving}>
                {saving ? "Saving…" : editing ? "Save changes" : "Add equipment"}
              </button>
              {editing && (
                <button
                  type="button"
                  className="soft-button"
                  onClick={() => {
                    setEditing(null);
                    setForm(empty);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Your collection</p>
              <h2 className="mt-1 text-xl font-semibold">Active equipment</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {items.length} items
            </span>
          </div>
          {loading ? (
            <div className="mt-5 h-56 animate-pulse rounded-2xl bg-slate-100" />
          ) : items.length === 0 ? (
            <div className="empty-state mt-5 min-h-48">
              <Boxes size={30} />
              <p className="mt-3 font-medium">No active equipment</p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.category} · {item.quantity} available · ฿{item.rentalRate}/day
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      className="soft-button !px-3"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => edit(item)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="soft-button !border-rose-100 !px-3 !text-rose-700"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => remove(item)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
