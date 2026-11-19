const Equipment = require("../models/Equipment");
const SavedEquipment = require("../models/SavedEquipment");

const isEquipmentId = (value) => /^[a-fA-F0-9]{24}$/.test(value);

exports.getSavedEquipment = async (req, res, next) => {
  try {
    const saved = await SavedEquipment.find({ user: req.user.id })
      .populate({
        path: "equipment",
        match: { isActive: true },
        select: "name category description quantity rentalRate isActive createdAt updatedAt",
      })
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: saved.filter((entry) => entry.equipment).length,
      data: saved.map((entry) => entry.equipment).filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

exports.saveEquipment = async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    if (!isEquipmentId(equipmentId)) {
      return res.status(400).json({ success: false, error: "A valid equipment ID is required" });
    }

    const equipment = await Equipment.findOne({ _id: equipmentId, isActive: true });
    if (!equipment) {
      return res.status(404).json({ success: false, error: "Equipment not found or inactive" });
    }

    await SavedEquipment.updateOne(
      { user: req.user.id, equipment: equipment._id },
      { $setOnInsert: { user: req.user.id, equipment: equipment._id } },
      { upsert: true }
    );
    res.status(200).json({ success: true, data: equipment });
  } catch (error) {
    next(error);
  }
};

exports.removeSavedEquipment = async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    if (!isEquipmentId(equipmentId)) {
      return res.status(400).json({ success: false, error: "A valid equipment ID is required" });
    }

    await SavedEquipment.deleteOne({ user: req.user.id, equipment: equipmentId });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
