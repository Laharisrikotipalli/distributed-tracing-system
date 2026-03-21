const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

// In-memory storage
let spans = [];

/**

* POST /api/spans
* Store incoming span
*/
app.post("/api/spans", (req, res) => {
const span = req.body;

if (!span || !span.traceId || !span.spanId) {
return res.status(400).json({ error: "Invalid span" });
}

spans.push(span);
res.status(201).json({ message: "stored" });
});

/**

* GET /api/traces

* Return trace summaries
*/
app.get("/api/traces", (req, res) => {
try {
const grouped = {};

// Group spans by traceId
for (let i = 0; i < spans.length; i++) {
const s = spans[i];

if (!s || !s.traceId) continue;

if (!grouped[s.traceId]) {
grouped[s.traceId] = [];
}

grouped[s.traceId].push(s);
}

const result = [];

// Build trace summaries
for (const traceId in grouped) {
const traceSpans = grouped[traceId];

let min = Infinity;
let max = -Infinity;
const services = new Set();

for (let i = 0; i < traceSpans.length; i++) {
const s = traceSpans[i];

 let start = 0;
 if (s.startTime) {
   const t = new Date(s.startTime).getTime();
   if (!isNaN(t)) start = t;
 }

 let duration = 0;
 if (typeof s.durationMs === "number") {
   duration = s.durationMs;
 }

 const end = start + duration;

 if (start < min) min = start;
 if (end > max) max = end;

 if (s.serviceName) {
   services.add(s.serviceName);
 }

}

// Edge case handling
if (min === Infinity || max === -Infinity) {
min = 0;
max = 0;
}

result.push({
traceId: traceId,
durationMs: max - min,
spanCount: traceSpans.length,
services: Array.from(services)
});
}

res.json(result);

} catch (err) {
console.error("TRACE ERROR:", err);
res.status(500).json({ error: "Internal error" });
}
});

/**

* GET /api/traces/:traceId
* Return spans of a specific trace
*/
app.get("/api/traces/:traceId", (req, res) => {
const traceId = req.params.traceId;

const result = spans.filter(s => s.traceId === traceId);

res.json(result);
});

/**

* Health check
*/
app.get("/health", (req, res) => {
res.send("OK");
});

app.listen(PORT, () => {
console.log("Collector running on port", PORT);
});