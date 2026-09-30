import db from "../db/database.js";

db.exec(`
    CREATE TABLE IF NOT EXISTS sms_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT NOT NULL,
        direction TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

export function sendSMS(phone, message) {
    const result = db.prepare(`
        INSERT INTO sms_messages (
            phone,
            direction,
            message
        )
        VALUES (?, 'OUTGOING', ?)
    `).run(phone, message);

    console.log(`SMS → ${phone}: ${message}`);

    return {
        id: result.lastInsertRowid,
        phone,
        direction: "OUTGOING",
        message
    };
}

export function receiveSMS(phone, message) {
    const result = db.prepare(`
        INSERT INTO sms_messages (
            phone,
            direction,
            message
        )
        VALUES (?, 'INCOMING', ?)
    `).run(phone, message);

    console.log(`SMS ← ${phone}: ${message}`);

    return {
        id: result.lastInsertRowid,
        phone,
        direction: "INCOMING",
        message
    };
}

export function getConversation(phone) {
    return db.prepare(`
        SELECT
            id,
            phone,
            direction,
            message,
            created_at
        FROM sms_messages
        WHERE phone = ?
        ORDER BY created_at ASC, id ASC
    `).all(phone);
}