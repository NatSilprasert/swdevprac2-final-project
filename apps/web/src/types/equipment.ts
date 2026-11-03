export interface Equipment {
  _id: string;
  name: string;
  category: string;
  description: string;
  /** Available quantity */
  quantity: number;
  /** Rental rate per item per day */
  rentalRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EquipmentInput = Pick<
  Equipment,
  "name" | "category" | "description" | "quantity" | "rentalRate"
> &
  Partial<Pick<Equipment, "isActive">>;
