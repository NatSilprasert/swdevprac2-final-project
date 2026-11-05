"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Package, ShieldCheck } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAppSelector } from "@/store/hooks";
import type { Equipment } from "@/types/equipment";
import type { RentalInput } from "@/types/rental";

export function EquipmentDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, hydrated } = useAppSelector((state) => state.auth);
  const [item, setItem] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    apiClient
      .get<Equipment>(`/equipment/${params.id}`)
      .then(setItem)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const input: RentalInput = {
      equipment: params.id,
      quantity: Number(values.get("quantity")),
      startDate: String(values.get("startDate")),
      returnDate: String(values.get("returnDate")),
    };
    setSaving(true);
    setError("");
    try {
      await apiClient.post("/rentals", input);
      setSuccess(true);
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-100" />;
  if (!item)
    return (
      <div className="empty-state">
        <Package size={32} />
        <p className="mt-3 font-medium">Equipment could not be found</p>
        <Link href="/" className="mt-3 text-sm font-semibold text-emerald-700">
          Return to collection
        </Link>
        {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} /> Back to collection
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-8">
          <div className="equipment-art art-0 !h-72 !rounded-3xl">
            <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold">
              {item.category}
            </span>
            <Package className="equipment-icon !h-24 !w-24" strokeWidth={1} />
            <span className="absolute bottom-5 right-5 text-xs font-semibold text-slate-500">
              AVAILABLE NOW
            </span>
          </div>
          <h1 className="mt-7 text-3xl font-semibold tracking-tight">{item.name}</h1>
          <p className="mt-3 leading-7 text-slate-600">{item.description}</p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Rental rate</p>
              <p className="mt-1 text-xl font-semibold">
                ฿{item.rentalRate.toLocaleString()}{" "}
                <span className="text-sm font-normal text-slate-500">/ day</span>
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Available units</p>
              <p className="mt-1 text-xl font-semibold">
                {item.quantity} <span className="text-sm font-normal text-slate-500">items</span>
              </p>
            </div>
          </div>
        </section>
        <section className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="eyebrow">Make it yours</p>
          <h2 className="mt-2 text-2xl font-semibold">Request a rental</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Choose your dates and the number of items. Your request will be sent to the equipment
            team.
          </p>
          {!hydrated ? (
            <div className="mt-6 h-28 animate-pulse rounded-2xl bg-slate-100" />
          ) : !user ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-600">
                Sign in with a member account to request this equipment.
              </p>
              <Link className="action-button mt-4" href="/login">
                Sign in to continue
              </Link>
            </div>
          ) : user.role !== "member" ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
              Administrator accounts manage equipment and requests. Sign in as a member to place a
              rental request.
            </div>
          ) : success ? (
            <div className="notice-success mt-6">
              <span className="inline-flex items-center gap-2 font-semibold">
                <Check size={17} /> Request submitted
              </span>
              <p className="mt-2 text-sm">
                Your rental request has been recorded. Equipment availability is not reserved until
                further action.
              </p>
              <button
                className="mt-4 text-sm font-semibold underline"
                onClick={() => router.push("/rentals")}
              >
                View my requests
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="form-label" htmlFor="quantity">
                  Quantity
                </label>
                <select id="quantity" name="quantity" className="form-control" required>
                  {Array.from({ length: Math.min(3, item.quantity) }, (_, index) => index + 1).map(
                    (value) => (
                      <option key={value} value={value}>
                        {value} {value === 1 ? "item" : "items"}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label" htmlFor="startDate">
                    Start date
                  </label>
                  <input
                    className="form-control"
                    id="startDate"
                    name="startDate"
                    type="date"
                    min={today}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="returnDate">
                    Return date
                  </label>
                  <input
                    className="form-control"
                    id="returnDate"
                    name="returnDate"
                    type="date"
                    min={today}
                    required
                  />
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">
                <CalendarDays className="mb-1" size={16} /> Rentals can be up to 7 days. Same-day
                rental is allowed.
              </div>
              {error && <p className="notice-error">{error}</p>}
              <button disabled={saving || item.quantity < 1} className="action-button w-full">
                {saving ? "Sending request…" : "Send rental request"}
              </button>
              <p className="inline-flex items-start gap-1.5 text-xs leading-5 text-slate-400">
                <ShieldCheck className="mt-0.5 shrink-0" size={14} />
                No payment is collected here. Rental rates are shown per item per day.
              </p>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
