import express from "express";
import db from "../db/database.js";

const router = express.Router();

router.post("/register", (req, res) => {
  try {
    const { name, phone, location } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        error: "name and phone are required"
      });
    }

    const existing = db
      .prepare("SELECT id FROM farmers WHERE phone = ?")
      .get(phone);

    if (existing) {
      return res.status(409).json({
        error: "Farmer already exists",
        farmerId: existing.id
      });
    }

    const result = db
      .prepare(`
        INSERT INTO farmers (name, phone, location)
        VALUES (?, ?, ?)
      `)
      .run(name, phone, location || null);

    res.status(201).json({
      message: "Farmer registered successfully",
      farmerId: result.lastInsertRowid
    });

  } catch (error) {
    console.error("Farmer registration error:", error);

    res.status(500).json({
      error: "Failed to register farmer"
    });
  }
});


router.post("/:farmerId/requirements", (req, res) => {
  try {
    const { farmerId } = req.params;
    const { product, quantity, unit, required_by } = req.body;

    if (!product || !quantity) {
      return res.status(400).json({
        error: "product and quantity are required"
      });
    }

    const farmer = db
      .prepare("SELECT id FROM farmers WHERE id = ?")
      .get(farmerId);

    if (!farmer) {
      return res.status(404).json({
        error: "Farmer not found"
      });
    }

    const result = db
      .prepare(`
        INSERT INTO requirements
        (farmer_id, product, quantity, unit, required_by)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        farmerId,
        product,
        quantity,
        unit || "kg",
        required_by || null
      );

    res.status(201).json({
      message: "Requirement created successfully",
      requirementId: result.lastInsertRowid
    });

  } catch (error) {
    console.error("Requirement error:", error);

    res.status(500).json({
      error: "Failed to create requirement"
    });
  }
});


router.get("/:farmerId/requirements", (req, res) => {
  try {
    const { farmerId } = req.params;

    const requirements = db
      .prepare(`
        SELECT
          id,
          product,
          quantity,
          unit,
          required_by,
          status,
          created_at
        FROM requirements
        WHERE farmer_id = ?
        ORDER BY created_at DESC
      `)
      .all(farmerId);

    res.json({
      farmerId: Number(farmerId),
      requirements
    });

  } catch (error) {
    console.error("Fetch requirements error:", error);

    res.status(500).json({
      error: "Failed to fetch requirements"
    });
  }
});

export default router;