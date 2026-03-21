const express = require("express");
const axios = require("axios");
const client = require("prom-client");

const app = express();
app.use(express.json());

const PORT = 3002;
const COLLECTOR_URL = "http://collector:4000/api/spans";


const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
name: "http_requests_total",
help: "Total HTTP requests",
labelNames: ["service", "method", "path", "status"]
});

const httpRequestDuration = new client.Histogram({
name: "http_request_duration_seconds",
help: "Request duration",
labelNames: ["service"],
buckets: [0.1, 0.5, 1, 2, 5]
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);


app.use((req, res, next) => {
const end = httpRequestDuration.startTimer();

res.on("finish", () => {
httpRequestsTotal.inc({
service: "service-b",
method: req.method,
path: req.path,
status: res.statusCode
});

end({ service: "service-b" });

});

next();
});

function generateId() {
return Math.random().toString(16).substring(2, 18);
}

function parseTraceparent(header) {
const parts = header.split("-");
return {
traceId: parts[1],
parentSpanId: parts[2]
};
}

app.post("/work", async (req, res) => {
const startTime = new Date();

const traceHeader = req.headers["traceparent"];
const { traceId, parentSpanId } = parseTraceparent(traceHeader);

const spanId = generateId();

const delay = Math.floor(Math.random() * 400) + 100;
await new Promise(r => setTimeout(r, delay));

const duration = new Date() - startTime;

let status = "ok";
let errorDetails = null;

if (Math.random() < 0.2) {
status = "error";
errorDetails = "Random failure occurred";
}

await axios.post(COLLECTOR_URL, {
traceId,
spanId,
parentSpanId,
serviceName: "service-b",
startTime: startTime.toISOString(),
durationMs: duration,
status,
errorDetails
});

if (status === "error") {
return res.status(500).json({ error: "Service B failed" });
}

res.status(200).json({ message: "Service B done" });
});


app.get("/metrics", async (req, res) => {
res.set("Content-Type", register.contentType);
res.end(await register.metrics());
});

app.listen(PORT, () => {
console.log("Service B running on port", PORT);
});