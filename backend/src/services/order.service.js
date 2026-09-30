import db from "../db/database.js";

export function createOrder({
    requirement_id,
    supplier_id,
    product,
    quantity,
    price_per_unit,
    expected_delivery
}) {
    const total_amount = quantity * price_per_unit;

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
        requirement_id,
        supplier_id,
        product,
        quantity,
        price_per_unit,
        total_amount,
        expected_delivery
    );

    return db.prepare(`
        SELECT *
        FROM orders
        WHERE id = ?
    `).get(result.lastInsertRowid);
}