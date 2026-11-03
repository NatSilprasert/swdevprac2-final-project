const Equipment = require("../models/Equipment");

exports.getEquipmentList = async (req, res, next) => {
  try {
    const equipment = await Equipment.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: equipment.length, data: equipment });
  } catch (error) {
    next(error);
  }
};

exports.getEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findOne({ _id: req.params.id, isActive: true });
    if (!equipment) return res.status(404).json({ success: false, error: "Equipment not found" });
    res.status(200).json({ success: true, data: equipment });
  } catch (error) {
    next(error);
  }
};

exports.createEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.create(req.body);
    res.status(201).json({ success: true, data: equipment });
  } catch (error) {
    next(error);
  }
};

exports.updateEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    );
    if (!equipment) return res.status(404).json({ success: false, error: "Equipment not found" });
    res.status(200).json({ success: true, data: equipment });
  } catch (error) {
    next(error);
  }
};

exports.deleteEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    );
    if (!equipment) return res.status(404).json({ success: false, error: "Equipment not found" });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
