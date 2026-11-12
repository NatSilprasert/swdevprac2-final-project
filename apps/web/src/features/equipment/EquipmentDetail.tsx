"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Boxes, Camera, Check, Dumbbell, Laptop, Package } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { DateRangeFields } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { assetTag, formatBaht } from "@/lib/format";
import { useAppSelector } from "@/store/hooks";
import type { Equipment } from "@/types/equipment";
import type { RentalInput } from "@/types/rental";

const categoryIcons: Record<string, typeof Camera> = {
  camera: Camera,
  sports: Dumbbell,
  notebook: Laptop,
};

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

  if (loading) return <div className="skeleton h-96" />;
  if (!item)
    return (
      <div className="empty-state">
        <Package size={28} strokeWidth={1.5} />
        <p className="mt-3 font-medium text-foreground">Equipment not found</p>
        <Link href="/" className="link mt-3 text-sm">
          Back to equipment
        </Link>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    );

  const Icon = categoryIcons[item.category.toLowerCase()] ?? Boxes;

  return (
    <div className="rise-in mx-auto max-w-5xl">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> Equipment
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <section className="surface p-4 sm:p-6">
          <div className="relative flex h-56 items-center justify-center rounded-lg bg-muted">
            <span className="asset-tag absolute left-4 top-4">{assetTag(item)}</span>
            <span className="absolute right-4 top-4 text-xs text-muted-foreground">
              {item.category}
            </span>
            <Icon size={56} strokeWidth={1.25} className="text-foreground/70" />
          </div>
          <h1 className="page-title mt-6">{item.name}</h1>
          <p className="mt-2 leading-6 text-muted-foreground">{item.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-4">
              <dt className="text-xs text-muted-foreground">Rate</dt>
              <dd className="num mt-1 text-xl font-medium">
                {formatBaht(item.rentalRate)}{" "}
                <span className="text-sm font-normal text-muted-foreground">/ day</span>
              </dd>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <dt className="text-xs text-muted-foreground">Available</dt>
              <dd className="num mt-1 text-xl font-medium">
                {item.quantity}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {item.quantity === 1 ? "unit" : "units"}
                </span>
              </dd>
            </div>
          </dl>
        </section>
        <section className="surface h-fit p-6">
          <h2 className="text-lg font-medium">Request a rental</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a quantity and dates. The equipment team receives your request
          </p>
          {!hydrated ? (
            <div className="skeleton mt-6 h-28" />
          ) : !user ? (
            <div className="mt-6 rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Log in with a member account to request this item
              </p>
              <Link className="action-button mt-4" href="/login">
                Log in
              </Link>
            </div>
          ) : user.role !== "member" ? (
            <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              Administrator accounts manage equipment and requests. Log in as a member to place a
              rental request
            </div>
          ) : success ? (
            <div className="notice-success mt-6">
              <span className="inline-flex items-center gap-2 font-medium">
                <Check size={16} strokeWidth={1.5} /> Request submitted
              </span>
              <p className="mt-2">
                Your request is recorded. Equipment is not reserved until further action.
              </p>
              <button
                className="mt-3 font-medium underline underline-offset-4"
                onClick={() => router.push("/rentals")}
              >
                View my rentals
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="form-label" htmlFor="quantity">
                  Quantity
                </label>
                <Select
                  id="quantity"
                  name="quantity"
                  options={Array.from({ length: Math.min(3, item.quantity) }, (_, index) => ({
                    value: String(index + 1),
                    label: `${index + 1} ${index === 0 ? "unit" : "units"}`,
                  }))}
                />
              </div>
              <DateRangeFields idPrefix="rental" min={today} />
              <p className="text-xs text-muted-foreground">
                Up to 7 days per rental. Same-day return is allowed
              </p>
              {error && <p className="notice-error">{error}</p>}
              <button disabled={saving || item.quantity < 1} className="action-button w-full">
                {saving ? "Sending" : "Send rental request"}
              </button>
              <p className="text-xs text-muted-foreground">
                No payment is collected here. Rates are per unit per day
              </p>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
