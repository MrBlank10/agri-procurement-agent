import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schema = fs.readFileSync(
  path.join(__dirname, "schema.sql"),
  "utf8"
);

db.exec(schema);

console.log("Database initialized.");

const suppliers = [
  {
    name: "GreenGrow Agro",
    phone: "9000000001",
    location: "Trichy",
    reliability: 0.92
  },
  {
    name: "FarmFirst Supplies",
    phone: "9000000002",
    location: "Madurai",
    reliability: 0.87
  },
  {
    name: "AgroMart Traders",
    phone: "9000000003",
    location: "Thanjavur",
    reliability: 0.78
  }
];

const insertSupplier = db.prepare(`
  INSERT OR IGNORE INTO suppliers
  (name, phone, location, reliability)
  VALUES (?, ?, ?, ?)
`);

for (const supplier of suppliers) {
  insertSupplier.run(
    supplier.name,
    supplier.phone,
    supplier.location,
    supplier.reliability
  );
}

const supplierIds = db
  .prepare(`
    SELECT id
    FROM suppliers
    ORDER BY id
  `)
  .all();

if (supplierIds.length < 3) {
  throw new Error("Expected 3 suppliers.");
}

const offers = [
  {
    supplierId: supplierIds[0].id,
    product: "Fertilizer",
    quantity: 3000,
    price: 28,
    deliveryDays: 2
  },
  {
    supplierId: supplierIds[1].id,
    product: "Fertilizer",
    quantity: 5000,
    price: 29,
    deliveryDays: 3
  },
  {
    supplierId: supplierIds[2].id,
    product: "Fertilizer",
    quantity: 2500,
    price: 27,
    deliveryDays: 5
  }
];

const insertOffer = db.prepare(`
  INSERT INTO offers
  (
    supplier_id,
    product,
    quantity,
    price_per_unit,
    delivery_days,
    available
  )
  VALUES (?, ?, ?, ?, ?, 1)
`);

for (const offer of offers) {
  insertOffer.run(
    offer.supplierId,
    offer.product,
    offer.quantity,
    offer.price,
    offer.deliveryDays
  );
}

console.log("Demo suppliers and offers seeded.");

db.close();