import express from "express";
import { runProcurementAgent } from "../agent/procurement.agent.js";

const router = express.Router();

router.post("/run/:product", async (req, res) => {

    try {

        const product = req.params.product;

        const result =
            await runProcurementAgent(product);

        res.json(result);

    } catch (error) {

        console.error("Agent error:", error);

        res.status(500).json({
            error: "Agent execution failed",
            details: error.message
        });
    }
});

export default router;