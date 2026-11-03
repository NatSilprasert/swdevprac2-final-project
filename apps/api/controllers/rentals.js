const Rental = require("../models/Rental");
const Equipment = require("../models/Equipment");

const parseDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
};

const parseRentalInput = ({ quantity, startDate, returnDate }) => {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 3) {
    return { error: "Rental quantity must be an integer between 1 and 3" };
  }

  const start = parseDate(startDate);
  const end = parseDate(returnDate);
  if (!start || !end) return { error: "Valid startDate and returnDate in YYYY-MM-DD format are required" };

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (start < today) return { error: "Start date cannot be in the past" };
  if (end < start) return { error: "Return date cannot be before start date" };
  if ((end - start) / (24 * 60 * 60 * 1000) > 7) {
    return { error: "Rental duration cannot exceed 7 days" };
  }

  return { quantity, startDate: start, returnDate: end };
};

const populateRental = (query) => query
  .populate("equipment", "name category description quantity rentalRate isActive")
  .populate("user", "name email tel role");

exports.getRentals = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user.id };
    const rentals = await populateRental(Rental.find(filter).sort({ startDate: 1, createdAt: 1 }));
    res.status(200).json({ success: true, count: rentals.length, data: rentals });
  } catch (error) {
    next(error);
  }
};

exports.getRental = async (req, res, next) => {
  try {
    const rental = await populateRental(Rental.findById(req.params.id));
    if (!rental) return res.status(404).json({ success: false, error: "Rental request not found" });
    if (req.user.role !== "admin" && rental.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not authorized to view this rental request" });
    }
    res.status(200).json({ success: true, data: rental });
  } catch (error) {
    next(error);
  }
};

exports.createRental = async (req, res, next) => {
  try {
    const parsed = parseRentalInput(req.body);
    if (parsed.error) return res.status(400).json({ success: false, error: parsed.error });
    if (typeof req.body.equipment !== "string" || !/^[a-fA-F0-9]{24}$/.test(req.body.equipment)) {
      return res.status(400).json({ success: false, error: "A valid equipment ID is required" });
    }

    const equipment = await Equipment.findOne({ _id: req.body.equipment, isActive: true });
    if (!equipment) return res.status(404).json({ success: false, error: "Equipment not found or inactive" });
    if (parsed.quantity > equipment.quantity) {
      return res.status(400).json({ success: false, error: "Rental quantity exceeds available equipment" });
    }

    const rental = await Rental.create({
      equipment: equipment.id,
      user: req.user.id,
      quantity: parsed.quantity,
      startDate: parsed.startDate,
      returnDate: parsed.returnDate,
    });
    res.status(201).json({ success: true, data: await populateRental(Rental.findById(rental.id)) });
  } catch (error) {
    next(error);
  }
};

exports.updateRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ success: false, error: "Rental request not found" });
    if (req.user.role !== "admin" && rental.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not authorized to edit this rental request" });
    }

    const values = {
      quantity: req.body.quantity === undefined ? rental.quantity : req.body.quantity,
      startDate: req.body.startDate === undefined ? rental.startDate.toISOString().slice(0, 10) : req.body.startDate,
      returnDate: req.body.returnDate === undefined ? rental.returnDate.toISOString().slice(0, 10) : req.body.returnDate,
    };
    const parsed = parseRentalInput(values);
    if (parsed.error) return res.status(400).json({ success: false, error: parsed.error });

    const equipmentId = req.body.equipment === undefined ? rental.equipment.toString() : req.body.equipment;
    if (typeof equipmentId !== "string" || !/^[a-fA-F0-9]{24}$/.test(equipmentId)) {
      return res.status(400).json({ success: false, error: "A valid equipment ID is required" });
    }
    const equipment = await Equipment.findOne({ _id: equipmentId, isActive: true });
    if (!equipment) return res.status(404).json({ success: false, error: "Equipment not found or inactive" });
    if (parsed.quantity > equipment.quantity) {
      return res.status(400).json({ success: false, error: "Rental quantity exceeds available equipment" });
    }

    const updated = await Rental.findByIdAndUpdate(req.params.id, {
      equipment: equipment.id,
      quantity: parsed.quantity,
      startDate: parsed.startDate,
      returnDate: parsed.returnDate,
    }, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: await populateRental(Rental.findById(updated.id)) });
  } catch (error) {
    next(error);
  }
};

exports.deleteRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ success: false, error: "Rental request not found" });
    if (req.user.role !== "admin" && rental.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not authorized to delete this rental request" });
    }
    await rental.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
