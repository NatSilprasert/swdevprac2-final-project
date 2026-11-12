"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Archive, Boxes, ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Modal } from "@/components/ui/modal";
import { assetTag, formatBaht } from "@/lib/format";
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
  const [modalOpen, setModalOpen] = useState(false);
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
      setModalOpen(false);
      setNotice(editing ? "Equipment updated" : "Equipment added");
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
    setError("");
    setNotice("");
    setModalOpen(true);
  }

  function add() {
    setEditing(null);
    setForm(empty);
    setError("");
    setNotice("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(empty);
  }

  async function remove(item: Equipment) {
    if (!window.confirm(`Remove ${item.name} from active equipment? Rental history is kept.`))
      return;
    setError("");
    setNotice("");
    try {
      await apiClient.delete(`/equipment/${item._id}`);
      setItems((rows) => rows.filter((row) => row._id !== item._id));
      setNotice(`${item.name} is no longer active`);
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  if (!hydrated) return <div className="skeleton h-80" />;
  if (!user || user.role !== "admin")
    return (
      <div className="empty-state">
        <Archive size={28} strokeWidth={1.5} />
        <p className="mt-3 font-medium text-foreground">Administrator access required</p>
        <Link className="link mt-3 text-sm" href="/login">
          Log in as administrator
        </Link>
      </div>
    );

  const totalUnits = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="rise-in space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="page-title">Equipment dashboard</h1>
          <p className="page-lead">Manage active equipment and review rental requests</p>
        </div>
        <div className="flex gap-2">
          <Link href="/rentals" className="soft-button">
            <ClipboardList size={16} strokeWidth={1.5} /> Rental requests
          </Link>
          <button type="button" className="action-button h-9 px-3" onClick={add}>
            <Plus size={16} strokeWidth={1.5} /> Add equipment
          </button>
        </div>
      </div>
      {notice && <p className="notice-success">{notice}</p>}
      {error && !modalOpen && <p className="notice-error">{error}</p>}
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="surface p-5">
          <dt className="text-xs text-muted-foreground">Active listings</dt>
          <dd className="num mt-2 text-3xl font-medium">{items.length}</dd>
        </div>
        <div className="surface p-5">
          <dt className="text-xs text-muted-foreground">Units available</dt>
          <dd className="num mt-2 text-3xl font-medium">{totalUnits}</dd>
        </div>
      </dl>
      <div>
        <section className="surface p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-medium">Active equipment</h2>
            <span className="num text-xs text-muted-foreground">{items.length} items</span>
          </div>
          {loading ? (
            <div className="skeleton mt-5 h-56" />
          ) : items.length === 0 ? (
            <div className="empty-state mt-5 min-h-48">
              <Boxes size={28} strokeWidth={1.5} />
              <p className="mt-3 font-medium text-foreground">No active equipment</p>
            </div>
          ) : (
            <div className="mt-3 divide-y">
              {items.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="num mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                      <span className="font-mono">{assetTag(item)}</span>
                      <span>{item.category}</span>
                      <span>{item.quantity} available</span>
                      <span>{formatBaht(item.rentalRate)} / day</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      className="soft-button w-9 px-0"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => edit(item)}
                    >
                      <Pencil size={16} strokeWidth={1.5} />
                    </button>
                    <button
                      className="soft-button w-9 px-0 text-destructive"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => remove(item)}
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      {modalOpen && (
        <Modal title={editing ? "Edit equipment" : "Add equipment"} onClose={closeModal}>
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
                placeholder="Camera, Notebook, Sports"
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
                  Units available
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
            <div className="flex gap-2">
              <button className="action-button flex-1" disabled={saving}>
                {saving ? "Saving" : editing ? "Save changes" : "Add equipment"}
              </button>
              {editing && (
                <button type="button" className="soft-button h-10" onClick={closeModal}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
