import type { Equipment } from "@/types/equipment";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const formatBaht = (value: number) => `฿${value.toLocaleString("en-US")}`;

export const formatDate = (value: string) => dateFormat.format(new Date(value));

export const toDateInput = (value: string) => new Date(value).toISOString().slice(0, 10);

/** Short asset tag shown on every item, e.g. CAM-3F2 */
export function assetTag(item: Pick<Equipment, "_id" | "category">) {
  const prefix =
    item.category
      .replace(/[^a-z]/gi, "")
      .slice(0, 3)
      .toUpperCase() || "EQP";
  return `${prefix}-${item._id.slice(-3).toUpperCase()}`;
}
