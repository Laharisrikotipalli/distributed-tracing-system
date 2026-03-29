const express = require("express");
const axios = require("axios");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000; // Internal container port
const SERVICE_A_URL = "http://service-a:3001/work";
const SERVICE_B_URL = "http://service-b:3002/work"; 
const COLLECTOR_URL = "http://collector:4000/api/spans";

function generateId(bytes) { return crypto.randomBytes(bytes).toString('hex'); }

app.post("/api/go", async (req, res) => {
    const startTime = new Date();
    const traceId = generateId(16); 
    const spanId = generateId(8);   
    const traceparent = `00-${traceId}-${spanId}-01`;

    try {
        // Parallel calls to downstream services
        await Promise.all([
            axios.post(SERVICE_A_URL, {}, { headers: { traceparent }, timeout: 2500 }),
            axios.post(SERVICE_B_URL, {}, { headers: { traceparent }, timeout: 2500 })
        ]);
    } catch (err) {
        console.log(`Trace ${traceId}: Downstream failure recorded.`);
    }

    // Report Gateway Span
    await axios.post(COLLECTOR_URL, {
        traceId, spanId, parentSpanId: null,
        serviceName: "gateway", 
        startTime: startTime.toISOString(),
        durationMs: new Date() - startTime, 
        status: "ok"
    }).catch(() => {});

    res.status(200).json({ status: "ok", traceId });
});

app.listen(PORT, () => console.log(`Gateway listening on port ${PORT}`));