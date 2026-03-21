const express = require("express");
const axios = require("axios");
const client = require("prom-client");

const app = express();
app.use(express.json());

const PORT = 3000;

const SERVICE_A_URL = "http://service-a:3001/work";
const SERVICE_B_URL = "http://service-b:3002/work";
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
service: "gateway",
method: req.method,
path: req.path,
status: res.statusCode
});

end({ service: "gateway" });

});

next();
});


function generateId() {
return Math.random().toString(16).substring(2, 18);
}


function createTraceparent(traceId, spanId) {
return "00-${traceId}-${spanId}-01";
}


app.post("/api/go", async (req, res) => {
const startTime = new Date();

let traceId;
let parentSpanId = null;

if (req.headers["traceparent"]) {
const parts = req.headers["traceparent"].split("-");
traceId = parts[1];
parentSpanId = parts[2];
} else {
traceId = generateId();
}

const spanId = generateId();
const traceparent = createTraceparent(traceId, spanId);

try {
await Promise.all([
axios.post(SERVICE_A_URL, {}, { headers: { traceparent } }),
axios.post(SERVICE_B_URL, {}, { headers: { traceparent } })
]);
} catch (err) {
console.log("One service failed (expected)");
}

const duration = new Date() - startTime;

await axios.post(COLLECTOR_URL, {
traceId,
spanId,
parentSpanId,
serviceName: "gateway",
startTime: startTime.toISOString(),
durationMs: duration,
status: "ok",
errorDetails: null
});

res.status(200).json({ status: "ok" });
});

app.get("/metrics", async (req, res) => {
res.set("Content-Type", register.contentType);
res.end(await register.metrics());
});

app.listen(PORT, () => {
console.log("Gateway running on port", PORT);
});