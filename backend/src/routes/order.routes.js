import express from "express";
import db from "../db/database.js";
import { createOrder } from "../services/order.service.js";
import { findFallbackSupplier } from "../services/procurement.service.js";
import { logProcurementEvent } from "../services/event.service.js";
const router = express.Router();

// Manual order creation
router.post("/", (req, res) => {
    try {
        const {
            requirement_id,
            supplier_id,
            product,
            quantity,
            price_per_unit,
            expected_delivery
        } = req.body;

        if (
            !requirement_id ||
            !supplier_id ||
            !product ||
            !quantity ||
            !price_per_unit
        ) {
            return res.status(400).json({
                error: "Missing required order fields"
            });
        }

        const order = createOrder({
            requirement_id,
            supplier_id,
            product,
            quantity,
            price_per_unit,
            expected_delivery
        });

        res.status(201).json({
            message: "Procurement order created successfully",
            order
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create procurement order"
        });
    }
});


// Automatic procurement execution
router.post("/auto/:product", (req, res) => {
    try {
        const product = req.params.product;

        const demand = db.prepare(`
            SELECT
                id,
                farmer_id,
                product,
                quantity,
                unit,
                required_by
            FROM requirements
            WHERE LOWER(product) = LOWER(?)
            AND status = 'OPEN'
        `).all(product);

        if (demand.length === 0) {
            return res.status(404).json({
                error: `No open requirements found for ${product}`
            });
        }

        const totalDemand = demand.reduce(
            (sum, row) => sum + row.quantity,
            0
        );

        const requirementId = demand[0].id;

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
        `).all(product);

        let remaining = totalDemand;
        const allocations = [];

        for (const offer of offers) {
            if (remaining <= 0) break;

            const quantity = Math.min(
                offer.quantity,
                remaining
            );

            allocations.push({
                offer_id: offer.offer_id,
                supplier_id: offer.supplier_id,
                supplier_name: offer.supplier_name,
                quantity,
                price_per_unit: offer.price_per_unit,
                delivery_days: offer.delivery_days
            });

            remaining -= quantity;
        }

        if (allocations.length === 0) {
            return res.status(400).json({
                error: "No supplier stock available"
            });
        }

        const executeOrders = db.transaction(() => {
            const createdOrders = [];

            for (const allocation of allocations) {

                const expectedDelivery = new Date(
                    Date.now() +
                    allocation.delivery_days * 24 * 60 * 60 * 1000
                )
                    .toISOString()
                    .split("T")[0];

                const order = createOrder({
                    requirement_id: requirementId,
                    supplier_id: allocation.supplier_id,
                    product,
                    quantity: allocation.quantity,
                    price_per_unit: allocation.price_per_unit,
                    expected_delivery: expectedDelivery
                });

                createdOrders.push(order);

                db.prepare(`
                    UPDATE offers
                    SET quantity = quantity - ?
                    WHERE id = ?
                `).run(
                    allocation.quantity,
                    allocation.offer_id
                );
            }

            return createdOrders;
        });

        const orders = executeOrders();

        res.status(201).json({
            message: "Automatic procurement executed successfully",
            product,
            total_demand: totalDemand,
            fulfilled_quantity: totalDemand - remaining,
            shortage_quantity: remaining,
            orders
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to execute automatic procurement"
        });
    }
});


router.post("/:orderId/fail", (req, res) => {
    try {
        const orderId = Number(req.params.orderId);

        const order = db.prepare(`
            SELECT
                o.*,
                s.name AS supplier_name
            FROM orders o
            JOIN suppliers s
                ON s.id = o.supplier_id
            WHERE o.id = ?
        `).get(orderId);

        if (!order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        if (order.status === "FAILED") {
            return res.status(400).json({
                error: "Order has already failed"
            });
        }

        db.prepare(`
            UPDATE orders
            SET status = 'FAILED'
            WHERE id = ?
        `).run(orderId);

        db.prepare(`
            UPDATE offers
            SET available = 0
            WHERE supplier_id = ?
            AND LOWER(product) = LOWER(?)
        `).run(
            order.supplier_id,
            order.product
        );

        logProcurementEvent({
            order_id: orderId,
            event_type: "SUPPLIER_FAILURE",
            message:
                `Supplier ${order.supplier_name} failed to fulfill ` +
                `${order.quantity} ${order.product}.`
        });

        const recovery = findFallbackSupplier(
            order.product,
            order.quantity,
            [order.supplier_id]
        );

        if (recovery.recoverable_quantity === 0) {
            logProcurementEvent({
                order_id: orderId,
                event_type: "REPLAN_FAILED",
                message:
                    `No alternative supplier available for ` +
                    `${order.quantity} ${order.product}.`
            });

            return res.json({
                message: "Supplier failure detected",
                original_order: order,
                recovery,
                replan_status: "NO_ALTERNATIVE"
            });
        }

        const executeReplan = db.transaction(() => {

            const replacementOrders = [];

            for (const alternative of recovery.alternatives) {

                const expectedDelivery = new Date(
                    Date.now() +
                    alternative.delivery_days *
                    24 * 60 * 60 * 1000
                )
                    .toISOString()
                    .split("T")[0];

                const replacementOrder = createOrder({
                    requirement_id: order.requirement_id,
                    supplier_id: alternative.supplier_id,
                    product: order.product,
                    quantity: alternative.quantity,
                    price_per_unit:
                        alternative.price_per_unit,
                    expected_delivery:
                        expectedDelivery
                });

                replacementOrders.push(replacementOrder);

                db.prepare(`
                    UPDATE offers
                    SET quantity = quantity - ?
                    WHERE id = ?
                `).run(
                    alternative.quantity,
                    alternative.offer_id
                );

                logProcurementEvent({
                    order_id: replacementOrder.id,
                    event_type: "REPLAN_ORDER_CREATED",
                    message:
                        `Replacement order created with ` +
                        `${alternative.supplier_name} for ` +
                        `${alternative.quantity} ${order.product}.`
                });
            }

            return replacementOrders;
        });

        const replacementOrders = executeReplan();

        logProcurementEvent({
            order_id: orderId,
            event_type: "REPLAN_COMPLETE",
            message:
                `Automatic replanning completed. ` +
                `${recovery.recoverable_quantity} ` +
                `${order.product} recovered.`
        });

        res.json({
            message:
                "Supplier failure detected and procurement replanned",

            original_order: {
                id: order.id,
                supplier: order.supplier_name,
                quantity: order.quantity,
                product: order.product,
                status: "FAILED"
            },

            recovery,

            replacement_orders:
                replacementOrders,

            replan_status:
                recovery.remaining_shortage === 0
                    ? "FULLY_REPLANNED"
                    : "PARTIALLY_REPLANNED"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to process supplier failure"
        });
    }
});

router.get("/:orderId/events", (req, res) => {
    try {
        const orderId = Number(req.params.orderId);

        const events = db.prepare(`
            SELECT
                id,
                order_id,
                event_type,
                message,
                created_at
            FROM procurement_events
            WHERE order_id = ?
            ORDER BY created_at ASC
        `).all(orderId);

        res.json({
            orderId,
            events
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch procurement events"
        });
    }
});

// =====================================================
// ORDER MONITORING
// =====================================================

router.get("/:orderId/status", (req, res) => {
    try {
        const orderId = Number(req.params.orderId);

        const order = db.prepare(`
            SELECT
                o.*,
                s.name AS supplier_name,
                s.reliability
            FROM orders o
            JOIN suppliers s
                ON s.id = o.supplier_id
            WHERE o.id = ?
        `).get(orderId);

        if (!order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        let monitoringStatus = "ON_TRACK";

        if (order.status === "FAILED") {
            monitoringStatus = "FAILED";
        }

        if (
            order.status === "PLACED" &&
            order.expected_delivery
        ) {
            const today = new Date();
            const deliveryDate =
                new Date(order.expected_delivery);

            if (today > deliveryDate) {
                monitoringStatus = "DELAYED";
            }
        }

        res.json({
            order_id: order.id,
            product: order.product,
            supplier: order.supplier_name,
            quantity: order.quantity,
            expected_delivery: order.expected_delivery,
            order_status: order.status,
            monitoring_status: monitoringStatus,
            reliability: order.reliability
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to monitor order"
        });
    }
});

export default router;


