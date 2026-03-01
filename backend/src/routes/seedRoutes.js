import express from "express";
import { seedUsers } from "../utils/seedUsers.js";

const router = express.Router();

router.post("/users", async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Seeding disabled in production" });
    }

    const createdOrUpdated = await seedUsers();
    return res.status(200).json({
      message: "Demo users seeded successfully",
      createdOrUpdated,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

