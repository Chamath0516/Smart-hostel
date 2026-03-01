import User from "../models/User.js";

const DEMO_PASSWORD = "Password123!";

const demoUsers = [
  {
    name: "Demo Student",
    email: "student@test.com",
    password: DEMO_PASSWORD,
    role: "student",
    phone: "1000000001",
  },
  {
    name: "Demo Warden",
    email: "warden@test.com",
    password: DEMO_PASSWORD,
    role: "warden",
    phone: "1000000002",
  },
  {
    name: "Demo Security",
    email: "security@test.com",
    password: DEMO_PASSWORD,
    role: "security",
    phone: "1000000003",
  },
  {
    name: "Demo Finance",
    email: "finance@test.com",
    password: DEMO_PASSWORD,
    role: "finance",
    phone: "1000000004",
  },
  {
    name: "Demo Admin",
    email: "admin@test.com",
    password: DEMO_PASSWORD,
    role: "admin",
    phone: "1000000005",
  },
];

export const seedUsers = async () => {
  let createdOrUpdated = 0;

  for (const userData of demoUsers) {
    const existingUser = await User.findOne({ email: userData.email }).select("+password");

    if (!existingUser) {
      await User.create(userData);
      createdOrUpdated += 1;
      continue;
    }

    existingUser.name = userData.name;
    existingUser.role = userData.role;
    existingUser.phone = userData.phone;
    existingUser.password = userData.password;

    await existingUser.save();
    createdOrUpdated += 1;
  }

  return createdOrUpdated;
};

