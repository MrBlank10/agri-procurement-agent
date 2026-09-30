import express from "express";
import db from "../db/database.js";
import { findFallbackSupplier } from "../services/procurement.service.js";

const router = express.Router();


// =====================================================
// DEMAND POOLING + SUPPLIER COMPARISON
// =====================================================

router.get("/pool/:product", (req, res) => {
    try {
        const product = req.params.product;

        const demand = db.prepare(`
            SELECT
                r.id,
                r.farmer_id,
                r.product,
                r.quantity,
                r.unit,
                r.required_by
            FROM requirements r
            WHERE LOWER(r.product) = LOWER(?)
            AND r.status = 'OPEN'
        `).all(product);

        if (demand.length === 0) {
            return res.status(404).json({
                error: `No open requirements found for ${product}`
            });
        }

        const totalQuantity = demand.reduce(
            (sum, row) => sum + row.quantity,
            0
        );

        const unit = demand[0].unit;

        const offers = db.prepare(`
            SELECT
                o.id,
                o.supplier_id,
                s.name AS supplier_name,
                s.location,
                s.reliability,
                o.product,
                o.quantity,
                o.price_per_unit,
                o.delivery_days,
                o.available
            FROM offers o
            JOIN suppliers s ON s.id = o.supplier_id
            WHERE LOWER(o.product) = LOWER(?)
            AND o.available = 1
            AND o.quantity > 0
            ORDER BY o.price_per_unit ASC
        `).all(product);

        const supplierOptions = offers.map(offer => ({
            supplier_id: offer.supplier_id,
            supplier_name: offer.supplier_name,
            location: offer.location,
            available_quantity: offer.quantity,
            price_per_unit: offer.price_per_unit,
            delivery_days: offer.delivery_days,
            reliability: offer.reliability,
            can_fulfill_entire_order:
                offer.quantity >= totalQuantity,
            total_cost_if_selected:
                offer.quantity >= totalQuantity
                    ? totalQuantity * offer.price_per_unit
                    : null
        }));

        const fullSuppliers = supplierOptions.filter(
            supplier => supplier.can_fulfill_entire_order
        );

        let recommendedSupplier = null;

        if (fullSuppliers.length > 0) {
            recommendedSupplier = fullSuppliers.reduce(
                (best, current) =>
                    current.price_per_unit < best.price_per_unit
                        ? current
                        : best
            );
        }

        let splitProcurement = null;

        if (!recommendedSupplier) {
            let remaining = totalQuantity;
            const allocations = [];

            for (const supplier of supplierOptions) {
                if (remaining <= 0) break;

                const allocated = Math.min(
                    supplier.available_quantity,
                    remaining
                );

                allocations.push({
                    supplier_id: supplier.supplier_id,
                    supplier_name: supplier.supplier_name,
                    quantity: allocated,
                    price_per_unit: supplier.price_per_unit,
                    cost: allocated * supplier.price_per_unit,
                    delivery_days: supplier.delivery_days
                });

                remaining -= allocated;
            }

            splitProcurement = {
                fulfilled_quantity: totalQuantity - remaining,
                remaining_quantity: remaining,
                allocations
            };
        }

        res.json({
            product,
            pooled_demand: {
                farmer_count: demand.length,
                total_quantity: totalQuantity,
                unit
            },
            supplier_options: supplierOptions,
            recommended_supplier: recommendedSupplier,
            split_procurement: splitProcurement
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to calculate procurement pool"
        });
    }
});


// =====================================================
// FALLBACK / RECOVERY
// =====================================================

router.get("/fallback/:product/:shortage", (req, res) => {
    try {
        const product = req.params.product;
        const shortage = Number(req.params.shortage);

        if (!shortage || shortage <= 0) {
            return res.status(400).json({
                error: "Shortage must be greater than zero"
            });
        }

        const recovery = findFallbackSupplier(
            product,
            shortage
        );

        res.json({
            product,
            ...recovery,
            status:
                recovery.remaining_shortage === 0
                    ? "RECOVERABLE"
                    : "PARTIAL_RECOVERY"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to find fallback supplier"
        });
    }
});


export default router;