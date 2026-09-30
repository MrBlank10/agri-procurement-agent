import express from "express";
import db from "../db/database.js";
import {
    receiveSMS,
    sendSMS,
    getConversation
} from "../services/sms.service.js";
import { runProcurementAgent } from "../agent/procurement.agent.js";

const router = express.Router();

/*
    Parse messages like:

    "Need 1000 kg fertilizer"
    "Need 500 kg seeds"
*/
function parseRequirement(message) {
    const match = message.match(
        /need\s+(\d+(?:\.\d+)?)\s*(kg|bags|litres|l|units)?\s+(.+)/i
    );

    if (!match) {
        return null;
    }

    return {
        quantity: Number(match[1]),
        unit: match[2] || "kg",
        product: match[3].trim()
    };
}


/*
    Incoming farmer SMS
*/
router.post("/incoming", async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({
                error: "phone and message are required"
            });
        }

        // Save incoming SMS
        const incomingSMS = receiveSMS(phone, message);

        // Understand SMS
        const requirement = parseRequirement(message);

        if (!requirement) {
            const reply = sendSMS(
                phone,
                "Please use format: Need 1000 kg fertilizer"
            );

            return res.json({
                incoming_sms: incomingSMS,
                response_sms: reply,
                status: "INVALID_FORMAT"
            });
        }

        // Find farmer by phone
        let farmer = db.prepare(`
            SELECT *
            FROM farmers
            WHERE phone = ?
        `).get(phone);

        // Create SMS farmer if not registered
        if (!farmer) {
            const result = db.prepare(`
                INSERT INTO farmers (
                    name,
                    phone,
                    location
                )
                VALUES (?, ?, ?)
            `).run(
                "SMS Farmer",
                phone,
                "Unknown"
            );

            farmer = db.prepare(`
                SELECT *
                FROM farmers
                WHERE id = ?
            `).get(result.lastInsertRowid);
        }

        // Create requirement
        const requirementResult = db.prepare(`
            INSERT INTO requirements (
                farmer_id,
                product,
                quantity,
                unit,
                required_by,
                status
            )
            VALUES (?, ?, ?, ?, ?, 'OPEN')
        `).run(
            farmer.id,
            requirement.product,
            requirement.quantity,
            requirement.unit,
            null
        );

        const requirementId =
            requirementResult.lastInsertRowid;

        // Run AG-03 agent
        const agentResult =
            await runProcurementAgent(
                requirement.product
            );

        // Execute actual procurement
        const demand = db.prepare(`
            SELECT
                id,
                farmer_id,
                product,
                quantity,
                unit
            FROM requirements
            WHERE LOWER(product) = LOWER(?)
            AND status = 'OPEN'
        `).all(requirement.product);

        const totalDemand = demand.reduce(
            (sum, row) => sum + row.quantity,
            0
        );

        const offers = db.prepare(`
            SELECT
                o.id AS offer_id,
                o.supplier_id,
                s.name AS supplier_name,
                o.product,
                o.quantity,
                o.price_per_unit,
                o.delivery_days
            FROM offers o
            JOIN suppliers s
                ON s.id = o.supplier_id
            WHERE LOWER(o.product) = LOWER(?)
            AND o.available = 1
            AND o.quantity > 0
            ORDER BY o.price_per_unit ASC
        `).all(requirement.product);

        let remaining = totalDemand;
        const allocations = [];

        for (const offer of offers) {
            if (remaining <= 0) break;

            const quantity = Math.min(
                offer.quantity,
                remaining
            );

            allocations.push({
                ...offer,
                allocated_quantity: quantity
            });

            remaining -= quantity;
        }

        if (allocations.length === 0) {
            const reply = sendSMS(
                phone,
                `No supplier stock is currently available for ${requirement.product}.`
            );

            return res.json({
                status: "NO_STOCK",
                incoming_sms: incomingSMS,
                response_sms: reply,
                agent: agentResult
            });
        }

        const orders = [];

        const transaction = db.transaction(() => {

            for (const allocation of allocations) {

                const expectedDelivery =
                    new Date(
                        Date.now() +
                        allocation.delivery_days *
                        24 * 60 * 60 * 1000
                    )
                    .toISOString()
                    .split("T")[0];

                const result = db.prepare(`
                    INSERT INTO orders (
                        requirement_id,
                        supplier_id,
                        product,
                        quantity,
                        price_per_unit,
                        total_amount,
                        expected_delivery,
                        status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'PLACED')
                `).run(
                    requirementId,
                    allocation.supplier_id,
                    requirement.product,
                    allocation.allocated_quantity,
                    allocation.price_per_unit,
                    allocation.allocated_quantity *
                    allocation.price_per_unit,
                    expectedDelivery
                );

                const order = db.prepare(`
                    SELECT *
                    FROM orders
                    WHERE id = ?
                `).get(result.lastInsertRowid);

                orders.push({
                    ...order,
                    supplier_name:
                        allocation.supplier_name
                });

                db.prepare(`
                    UPDATE offers
                    SET quantity = quantity - ?
                    WHERE id = ?
                `).run(
                    allocation.allocated_quantity,
                    allocation.offer_id
                );
            }
        });

                transaction();

        // Mark all pooled requirements for this product as fulfilled
        // once the complete demand has been procured.
        if (remaining === 0) {
            db.prepare(`
                UPDATE requirements
                SET status = 'FULFILLED'
                WHERE LOWER(product) = LOWER(?)
                AND status = 'OPEN'
            `).run(requirement.product);
        }

        // SMS confirmation
        const firstOrder = orders[0];

        const replyMessage =
            `Order placed successfully. ` +
            `Order #${firstOrder.id}: ` +
            `${firstOrder.quantity} ${firstOrder.product} ` +
            `with ${firstOrder.supplier_name}. ` +
            `Expected delivery: ${firstOrder.expected_delivery}.`;

        const responseSMS =
            sendSMS(phone, replyMessage);

        res.status(201).json({
            status: "ORDER_PLACED",
            farmer,
            requirement: {
                id: requirementId,
                product: requirement.product,
                quantity: requirement.quantity,
                unit: requirement.unit
            },
            agent: agentResult,
            orders,
            incoming_sms: incomingSMS,
            response_sms: responseSMS
        });

    } catch (error) {
        console.error("SMS procurement error:", error);

        res.status(500).json({
            error: "Failed to process SMS procurement",
            details: error.message
        });
    }
});


/*
    Manual outgoing SMS
*/
router.post("/send", (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({
                error: "phone and message are required"
            });
        }

        const sms = sendSMS(phone, message);

        res.status(201).json({
            message: "SMS sent successfully",
            sms
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to send SMS"
        });
    }
});


/*
    Conversation history
*/
router.get("/conversation/:phone", (req, res) => {
    try {
        const phone = req.params.phone;

        const conversation =
            getConversation(phone);

        res.json({
            phone,
            messages: conversation
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch conversation"
        });
    }
});


export default router;