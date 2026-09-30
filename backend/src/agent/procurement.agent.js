import db from "../db/database.js";
import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { GoogleGenAI } from "@google/genai";
import { createOrder } from "../services/order.service.js";

const AgentState = Annotation.Root({
    product: Annotation({
        reducer: (_, value) => value,
        default: () => ""
    }),

    demand_data: Annotation({
        reducer: (_, value) => value,
        default: () => null
    }),

    plan_data: Annotation({
        reducer: (_, value) => value,
        default: () => null
    }),

    observation_data: Annotation({
        reducer: (_, value) => value,
        default: () => null
    }),

    reflection_data: Annotation({
        reducer: (_, value) => value,
        default: () => ""
    }),

    replan_data: Annotation({
        reducer: (_, value) => value,
        default: () => null
    })
});


// =========================
// PERCEIVE
// =========================

async function perceive(state) {

    const requirements = db.prepare(`
        SELECT *
        FROM requirements
        WHERE LOWER(product) = LOWER(?)
        AND status = 'OPEN'
    `).all(state.product);

    const totalQuantity = requirements.reduce(
        (sum, row) => sum + row.quantity,
        0
    );

    return {
        demand_data: {
            farmer_count: requirements.length,
            total_quantity: totalQuantity,
            unit: requirements[0]?.unit || "kg"
        }
    };
}


// =========================
// PLAN
// =========================

async function plan(state) {

    let reasoning =
        "Compare available suppliers and select feasible procurement options.";

    if (process.env.GEMINI_API_KEY) {

        try {

            const ai = new GoogleGenAI({
                apiKey: process.env.GEMINI_API_KEY
            });

            const response = await ai.models.generateContent({
                model: "gemini-3.8-flash",
                contents: `
You are an agricultural procurement planning agent.

Product: ${state.product}

Pooled demand:
${JSON.stringify(state.demand_data)}

Explain briefly how procurement should be planned.

Rules:
- Never invent supplier data.
- Prefer feasible low-cost suppliers.
- Consider availability and reliability.
- If a supplier fails, recommend replanning.
`
            });

            reasoning = response.text || reasoning;

                } catch (error) {
            console.error(
                "GEMINI ERROR:",
                error?.message || error
            );

            console.log(
                "Gemini unavailable. Using deterministic planning."
            );
        }
    }

    const offers = db.prepare(`
        SELECT
            o.id,
            o.supplier_id,
            s.name AS supplier_name,
            o.quantity,
            o.price_per_unit,
            o.delivery_days,
            s.reliability
        FROM offers o
        JOIN suppliers s
            ON s.id = o.supplier_id
        WHERE LOWER(o.product) = LOWER(?)
        AND o.available = 1
        AND o.quantity > 0
        ORDER BY o.price_per_unit ASC
    `).all(state.product);

    return {
        plan_data: {
            reasoning,
            suppliers: offers
        }
    };
}


// =========================
// ACT
// =========================

async function act(state) {

    const existingOrders = db.prepare(`
        SELECT *
        FROM orders
        WHERE LOWER(product) = LOWER(?)
        AND status IN ('PLACED', 'DELIVERED', 'FAILED')
    `).all(state.product);

    return {
        observation_data: {
            existing_orders: existingOrders,
            action:
                existingOrders.length > 0
                    ? "EXISTING_PROCUREMENT_FOUND"
                    : "PROCUREMENT_READY"
        }
    };
}


// =========================
// OBSERVE
// =========================

async function observe(state) {

    const orders = db.prepare(`
        SELECT
            o.id,
            o.requirement_id,
            o.supplier_id,
            s.name AS supplier_name,
            o.product,
            o.quantity,
            o.price_per_unit,
            o.status,
            o.expected_delivery
        FROM orders o
        JOIN suppliers s
            ON s.id = o.supplier_id
        WHERE LOWER(o.product) = LOWER(?)
        ORDER BY o.id DESC
    `).all(state.product);

    const failedOrders = orders.filter(
        order => order.status === "FAILED"
    );

    return {
        observation_data: {
            ...state.observation_data,
            orders,
            failed_orders: failedOrders
        }
    };
}


// =========================
// REFLECT
// =========================

async function reflect(state) {

    const failures =
        state.observation_data?.failed_orders || [];

    if (failures.length > 0) {

        return {
            reflection_data:
                "Supplier failure detected. Replanning is required."
        };
    }

    return {
        reflection_data:
            "Procurement is currently operating normally."
    };
}


// =========================
// REPLAN
// =========================

async function replan(state) {

    const failedOrders =
        state.observation_data?.failed_orders || [];

    if (failedOrders.length === 0) {

        return {
            replan_data: {
                status: "NOT_REQUIRED",
                message: "No failed supplier orders detected.",
                replacement_orders: []
            }
        };
    }

    const replacementOrders = [];

    for (const failedOrder of failedOrders) {

        // Check whether a replacement order already exists.
        // This makes the agent safe to run repeatedly.
        const existingReplacement = db.prepare(`
            SELECT
                o.*,
                s.name AS supplier_name
            FROM orders o
            JOIN suppliers s
                ON s.id = o.supplier_id
            WHERE o.requirement_id = ?
            AND LOWER(o.product) = LOWER(?)
            AND o.status = 'PLACED'
            AND o.supplier_id != ?
            ORDER BY o.id DESC
            LIMIT 1
        `).get(
            failedOrder.requirement_id,
            failedOrder.product,
            failedOrder.supplier_id
        );

        if (existingReplacement) {

            replacementOrders.push({
                ...existingReplacement,
                action: "EXISTING_REPLACEMENT_REUSED"
            });

            continue;
        }


        // Find alternative suppliers.
        const alternatives = db.prepare(`
            SELECT
                o.id AS offer_id,
                o.supplier_id,
                s.name AS supplier_name,
                o.quantity,
                o.price_per_unit,
                o.delivery_days,
                s.reliability
            FROM offers o
            JOIN suppliers s
                ON s.id = o.supplier_id
            WHERE LOWER(o.product) = LOWER(?)
            AND o.available = 1
            AND o.quantity > 0
            AND o.supplier_id != ?
            ORDER BY
                o.price_per_unit ASC,
                s.reliability DESC
        `).all(
            failedOrder.product,
            failedOrder.supplier_id
        );


        let remaining = failedOrder.quantity;

        for (const supplier of alternatives) {

            if (remaining <= 0) {
                break;
            }

            const quantity = Math.min(
                supplier.quantity,
                remaining
            );

            const expectedDelivery = new Date(
                Date.now() +
                supplier.delivery_days * 24 * 60 * 60 * 1000
            )
                .toISOString()
                .split("T")[0];


            const replacement = createOrder({
                requirement_id: failedOrder.requirement_id,
                supplier_id: supplier.supplier_id,
                product: failedOrder.product,
                quantity,
                price_per_unit: supplier.price_per_unit,
                expected_delivery: expectedDelivery
            });


            // Consume the replacement supplier stock.
            db.prepare(`
                UPDATE offers
                SET quantity = quantity - ?
                WHERE id = ?
            `).run(
                quantity,
                supplier.offer_id
            );


            // Record the replanning event.
            db.prepare(`
                INSERT INTO procurement_events
                (order_id, event_type, message)
                VALUES (?, ?, ?)
            `).run(
                replacement.id,
                "REPLAN_ORDER_CREATED",
                `Replacement order created after supplier ${failedOrder.supplier_id} failed.`
            );


            replacementOrders.push({
                ...replacement,
                supplier_name: supplier.supplier_name,
                action: "NEW_REPLACEMENT_CREATED"
            });


            remaining -= quantity;
        }


        if (remaining > 0) {

            db.prepare(`
                INSERT INTO procurement_events
                (order_id, event_type, message)
                VALUES (?, ?, ?)
            `).run(
                failedOrder.id,
                "REPLAN_INCOMPLETE",
                `Unable to recover ${remaining} units after supplier failure.`
            );
        }
    }


    const fullyRecovered =
        replacementOrders.length > 0 &&
        replacementOrders.every(
            order => order.action === "NEW_REPLACEMENT_CREATED" ||
                     order.action === "EXISTING_REPLACEMENT_REUSED"
        );

    return {
        replan_data: {
            status:
                fullyRecovered
                    ? "REPLAN_COMPLETE"
                    : "REPLAN_PARTIAL",

            replacement_orders: replacementOrders
        }
    };
}


// =========================
// LANGGRAPH WORKFLOW
// =========================

const workflow = new StateGraph(AgentState)

    .addNode("perceive", perceive)
    .addNode("plan", plan)
    .addNode("act", act)
    .addNode("observe", observe)
    .addNode("reflect", reflect)
    .addNode("replan", replan)

    .addEdge(START, "perceive")
    .addEdge("perceive", "plan")
    .addEdge("plan", "act")
    .addEdge("act", "observe")
    .addEdge("observe", "reflect")
    .addEdge("reflect", "replan")
    .addEdge("replan", END)

    .compile();


// =========================
// PUBLIC AGENT FUNCTION
// =========================

export async function runProcurementAgent(product) {

    const result = await workflow.invoke({
        product
    });

    return {
        agent: "AG-03 Procurement Agent",

        workflow: [
            "PERCEIVE",
            "PLAN",
            "ACT",
            "OBSERVE",
            "REFLECT",
            "REPLAN"
        ],

        product,

        demand: result.demand_data,

        plan: result.plan_data,

        observation: result.observation_data,

        reflection: result.reflection_data,

        replan: result.replan_data
    };
}