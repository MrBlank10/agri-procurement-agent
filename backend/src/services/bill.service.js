import db from "../db/database.js";
import crypto from "crypto";

export function createBill(orderId) {
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
        throw new Error("Order not found");
    }

    const existingBill = db.prepare(`
        SELECT *
        FROM bills
        WHERE order_id = ?
    `).get(orderId);

    if (existingBill) {
        return existingBill;
    }

    const billNumber =
        `BILL-${Date.now()}-${order.id}`;

    const qrToken = crypto.randomUUID();

    const result = db.prepare(`
        INSERT INTO bills (
            order_id,
            bill_number,
            total_amount,
            qr_token
        )
        VALUES (?, ?, ?, ?)
    `).run(
        order.id,
        billNumber,
        order.total_amount,
        qrToken
    );

    return db.prepare(`
        SELECT
            b.*,
            o.product,
            o.quantity,
            o.price_per_unit,
            o.status AS order_status,
            s.name AS supplier_name
        FROM bills b
        JOIN orders o
            ON o.id = b.order_id
        JOIN suppliers s
            ON s.id = o.supplier_id
        WHERE b.id = ?
    `).get(result.lastInsertRowid);
}


export function verifyBill(qrToken) {
    const bill = db.prepare(`
        SELECT
            b.*,
            o.product,
            o.quantity,
            o.price_per_unit,
            o.status AS order_status,
            s.name AS supplier_name
        FROM bills b
        JOIN orders o
            ON o.id = b.order_id
        JOIN suppliers s
            ON s.id = o.supplier_id
        WHERE b.qr_token = ?
    `).get(qrToken);

    if (!bill) {
        return null;
    }

    return bill;
}