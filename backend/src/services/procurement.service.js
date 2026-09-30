import db from "../db/database.js";

export function findFallbackSupplier(product, shortage) {
    const suppliers = db.prepare(`
        SELECT
            o.id AS offer_id,
            o.supplier_id,
            s.name AS supplier_name,
            s.location,
            s.reliability,
            o.quantity,
            o.price_per_unit,
            o.delivery_days
        FROM offers o
        JOIN suppliers s
            ON s.id = o.supplier_id
        WHERE LOWER(o.product) = LOWER(?)
        AND o.available = 1
        AND o.quantity > 0
        ORDER BY
            o.delivery_days ASC,
            s.reliability DESC,
            o.price_per_unit ASC
    `).all(product);

    let remaining = shortage;
    const alternatives = [];

    for (const supplier of suppliers) {
        if (remaining <= 0) break;

        const quantity = Math.min(
            supplier.quantity,
            remaining
        );

        alternatives.push({
            supplier_id: supplier.supplier_id,
            supplier_name: supplier.supplier_name,
            quantity,
            price_per_unit: supplier.price_per_unit,
            delivery_days: supplier.delivery_days,
            reliability: supplier.reliability,
            estimated_cost: quantity * supplier.price_per_unit
        });

        remaining -= quantity;
    }

    return {
        requested_quantity: shortage,
        recoverable_quantity: shortage - remaining,
        remaining_shortage: remaining,
        alternatives
    };
}