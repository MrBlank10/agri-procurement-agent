import express from "express";
import {
    createBill,
    verifyBill
} from "../services/bill.service.js";

const router = express.Router();


// Generate bill
router.post("/:orderId", (req, res) => {
    try {
        const orderId = Number(req.params.orderId);

        if (!orderId) {
            return res.status(400).json({
                error: "Valid order ID is required"
            });
        }

        const bill = createBill(orderId);

        res.status(201).json({
            message: "Bill generated successfully",
            bill
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message || "Failed to generate bill"
        });
    }
});


// Verify QR token
router.get("/verify/:qrToken", (req, res) => {
    try {
        const qrToken = req.params.qrToken;

        const bill = verifyBill(qrToken);

        if (!bill) {
            return res.status(404).json({
                valid: false,
                error: "Invalid QR token"
            });
        }

        res.json({
            valid: true,
            bill
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to verify bill"
        });
    }
});

export default router;