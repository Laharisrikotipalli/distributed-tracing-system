const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

let spans = [];

app.post("/api/spans", (req, res) => {
  const span = req.body;

  if (!span || !span.traceId || !span.spanId) {
    return res.status(400).json({ error: "Invalid span" });
  }

  spans.push(span);
  res.status(201).json({ message: "stored" });
});

app.get("/api/spans", (req, res) => {
  res.json(spans);
});

app.get("/api/traces", (req, res) => {
  const grouped = {};

  spans.forEach(s => {
    if (!grouped[s.traceId]) {
      grouped[s.traceId] = [];
    }
    grouped[s.traceId].push(s);
  });

  const result = [];

  for (const traceId in grouped) {
    const traceSpans = grouped[traceId];

    let min = Infinity;
    let max = -Infinity;
    const services = new Set();

    traceSpans.forEach(s => {
      const start = new Date(s.startTime).getTime() || 0;
      const duration = typeof s.durationMs === "number" ? s.durationMs : 0;
      const end = start + duration;

      if (start < min) min = start;
      if (end > max) max = end;

      services.add(s.serviceName);
    });

    const hasError = traceSpans.some(s =>
      s.status && s.status.toLowerCase() !== "ok"
    );

    result.push({
      traceId,
      durationMs: max - min,
      spanCount: traceSpans.length,
      services: Array.from(services),
      status: hasError ? "error" : "ok"
    });
  }

  res.json(result);
});

app.get("/api/traces/:traceId", (req, res) => {
  const traceId = req.params.traceId;
  const result = spans.filter(s => s.traceId === traceId);
  res.json(result);
});

app.get("/health", (req, res) => {
  res.send("OK");
});

app.listen(PORT, () => {
  console.log("Collector running on port", PORT);
});