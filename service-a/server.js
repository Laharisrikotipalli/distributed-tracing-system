const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const PORT = 3001; 
const COLLECTOR_URL = "http://collector:4000/api/spans";

function generateId(len = 16) {
    return [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

app.post("/work", async (req, res) => {
    const startTime = new Date();
    const traceHeader = req.headers["traceparent"];
    const parts = traceHeader ? traceHeader.split("-") : [];
    
    const traceId = parts[1] || generateId(32);
    const parentSpanId = parts[2] || null;
    const spanId = generateId(16);

    // 10% Failure Logic
    let status = "ok";
    let errorDetails = null;
    if (Math.random() < 0.1) {
        status = "error";
        errorDetails = "Random Simulated Failure";
    }

    // Artificial Latency
    await new Promise(r => setTimeout(r, Math.random() * 200 + 100));

    await axios.post(COLLECTOR_URL, {
        traceId, spanId, parentSpanId,
        serviceName: "service-a", // CHANGE THIS TO "service-b" in the other file
        startTime: startTime.toISOString(),
        durationMs: new Date() - startTime,
        status,
        errorDetails
    }).catch(() => {});

    if (status === "error") return res.status(500).json({ error: errorDetails });
    res.status(200).json({ message: "Success" });
});

app.listen(PORT, () => console.log("Service listening on port 3001"));