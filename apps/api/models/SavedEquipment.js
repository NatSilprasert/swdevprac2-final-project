const mongoose = require("mongoose");

const SavedEquipmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    equipment: { type: mongoose.Schema.ObjectId, ref: "Equipment", required: true },
  },
  { timestamps: true }
);

SavedEquipmentSchema.index({ user: 1, equipment: 1 }, { unique: true });

module.exports = mongoose.model("SavedEquipment", SavedEquipmentSchema);
