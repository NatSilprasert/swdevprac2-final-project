const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema(
  {
    equipment: { type: mongoose.Schema.ObjectId, ref: "Equipment", required: true },
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    quantity: {
      type: Number,
      required: [true, "Please add a rental quantity"],
      min: 1,
      max: 3,
      validate: { validator: Number.isInteger, message: "Quantity must be an integer" },
    },
    startDate: { type: Date, required: [true, "Please add a start date"] },
    returnDate: { type: Date, required: [true, "Please add a return date"] },
  },
  { timestamps: true }
);

RentalSchema.index({ user: 1, startDate: 1 });
RentalSchema.index({ equipment: 1, startDate: 1, returnDate: 1 });

module.exports = mongoose.model("Rental", RentalSchema);
