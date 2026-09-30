import express from "express";

import farmerRoutes from "./routes/farmer.routes.js";
import procurementRoutes from "./routes/procurement.routes.js";
import orderRoutes from "./routes/order.routes.js";
import billRoutes from "./routes/bill.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import smsRoutes from "./routes/sms.routes.js";

const app = express();

app.use(express.json());

app.use("/api/farmers", farmerRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/sms", smsRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "HACKSPRINT AG-03 Backend"
    });
});

export default app;