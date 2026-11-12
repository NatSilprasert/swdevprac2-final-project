const path = require("node:path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "../config/config.env") });

const User = require("../models/User");
const Equipment = require("../models/Equipment");
const Rental = require("../models/Rental");

const PASSWORD = "Test1234";

const users = [
  { name: "Nattaya Admin", email: "admin@gearhouse.test", tel: "0811112222", role: "admin" },
  { name: "Pimchanok Suwan", email: "pim@gearhouse.test", tel: "0823334444", role: "member" },
  { name: "Krit Anan", email: "krit@gearhouse.test", tel: "0845556666", role: "member" },
];

const equipment = [
  [
    "Sony A7 IV Body",
    "Camera",
    "33MP full-frame mirrorless body with dual card slots and 4K 60p video.",
    3,
    1200,
  ],
  [
    "Canon EOS R6 Mark II",
    "Camera",
    "24MP full-frame mirrorless with fast autofocus and in-body stabilization.",
    2,
    1100,
  ],
  [
    "Fujifilm X-T5 Kit",
    "Camera",
    "40MP APS-C camera with a 18-55mm kit lens, a good fit for travel and street work.",
    2,
    800,
  ],
  [
    "GoPro HERO12 Black",
    "Camera",
    "Waterproof action camera with HyperSmooth stabilization and two batteries.",
    5,
    350,
  ],
  [
    "MacBook Pro 14 M3",
    "Notebook",
    "14-inch laptop with 16 GB memory and 512 GB storage, charger included.",
    3,
    650,
  ],
  ["Dell XPS 15", "Notebook", "15-inch laptop with 32 GB memory and a 3.5K OLED display.", 2, 550],
  [
    "Lenovo ThinkPad T14",
    "Notebook",
    "14-inch business laptop with 16 GB memory and a long-life battery.",
    4,
    300,
  ],
  [
    "iPad Pro 11 with Pencil",
    "Notebook",
    "11-inch tablet with Apple Pencil Pro and a keyboard case.",
    2,
    400,
  ],
  [
    "Yonex Astrox 88D Racket",
    "Sports",
    "Badminton racket, strung and grip-wrapped, with a protective cover.",
    6,
    120,
  ],
  [
    "Wilson Pro Staff 97 Racket",
    "Sports",
    "Tennis racket for intermediate to advanced players, with a carry bag.",
    4,
    180,
  ],
  [
    "Trek Marlin 5 Mountain Bike",
    "Sports",
    "Hardtail mountain bike, size M, with a helmet and lock included.",
    3,
    450,
  ],
  [
    "Two-person Camping Tent",
    "Sports",
    "Lightweight dome tent with rainfly, sleeps two, packed weight 2.1 kg.",
    4,
    250,
  ],
];

const day = 24 * 60 * 60 * 1000;
const at = (offset) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return new Date(d.getTime() + offset * day);
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await Promise.all([Rental.deleteMany({}), Equipment.deleteMany({}), User.deleteMany({})]);

  // Create one by one so the password hashing hook runs.
  const createdUsers = [];
  for (const user of users) createdUsers.push(await User.create({ ...user, password: PASSWORD }));
  const [, pim, krit] = createdUsers;

  const items = await Equipment.insertMany(
    equipment.map(([name, category, description, quantity, rentalRate]) => ({
      name,
      category,
      description,
      quantity,
      rentalRate,
    }))
  );
  const byName = (name) => items.find((item) => item.name === name);

  await Rental.insertMany([
    {
      user: pim,
      equipment: byName("Sony A7 IV Body"),
      quantity: 1,
      startDate: at(2),
      returnDate: at(5),
    },
    {
      user: pim,
      equipment: byName("Two-person Camping Tent"),
      quantity: 2,
      startDate: at(9),
      returnDate: at(12),
    },
    {
      user: pim,
      equipment: byName("MacBook Pro 14 M3"),
      quantity: 1,
      startDate: at(-6),
      returnDate: at(-2),
    },
    {
      user: krit,
      equipment: byName("Trek Marlin 5 Mountain Bike"),
      quantity: 1,
      startDate: at(0),
      returnDate: at(2),
    },
    {
      user: krit,
      equipment: byName("GoPro HERO12 Black"),
      quantity: 3,
      startDate: at(4),
      returnDate: at(7),
    },
  ]);

  console.log(
    `Seeded ${createdUsers.length} users, ${items.length} equipment items, 5 rentals.\n` +
      `Admin: admin@gearhouse.test / ${PASSWORD}\n` +
      `Member: pim@gearhouse.test / ${PASSWORD}`
  );
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
