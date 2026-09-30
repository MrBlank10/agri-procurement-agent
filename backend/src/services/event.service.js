import db from "../db/database.js";

export function logProcurementEvent({
    order_id,
    event_type,
    message
}) {
    const result = db.prepare(`
        INSERT INTO procurement_events (
            order_id,
            event_type,
            message
        )
        VALUES (?, ?, ?)
    `).run(
        order_id,
        event_type,
        message
    );

    return db.prepare(`
        SELECT *
        FROM procurement_events
        WHERE id = ?
    `).get(result.lastInsertRowid);
}

export function getOrderEvents(order_id) {
    return db.prepare(`
        SELECT *
        FROM procurement_events
        WHERE order_id = ?
        ORDER BY created_at ASC
    `).all(order_id);
}
