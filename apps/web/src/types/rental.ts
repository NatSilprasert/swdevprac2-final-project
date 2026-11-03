import type { Equipment } from "@/types/equipment";
import type { User } from "@/types/auth";

export interface Rental {
  _id: string;
  equipment: Pick<
    Equipment,
    "_id" | "name" | "category" | "description" | "quantity" | "rentalRate" | "isActive"
  >;
  user: Pick<User, "name" | "email" | "role"> & { _id: string; tel: string };
  /** 1–3 per request */
  quantity: number;
  /** ISO date */
  startDate: string;
  /** ISO date, at most 7 days after startDate */
  returnDate: string;
  createdAt: string;
  updatedAt: string;
}

/** Dates are sent as `YYYY-MM-DD`. */
export interface RentalInput {
  equipment: string;
  quantity: number;
  startDate: string;
  returnDate: string;
}
