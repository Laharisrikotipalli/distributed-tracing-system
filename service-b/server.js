const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = 3002;

function generateId(len = 16) {
  return [...Array(len)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}

app.post("/work", async (req, res) => {
  const startTime = new Date();

  const traceparent = req.headers["traceparent"];
  if (!traceparent) {
    return res.status(400).json({ error: "Missing traceparent" });
  }

  const parts = traceparent.split("-");
  const traceId = parts[1];
  const parentSpanId = parts[2];
  const spanId = generateId();

  const delay = Math.floor(Math.random() * 400) + 100;
  await new Promise(r => setTimeout(r, delay));

  let status = "ok";
  let errorDetails = null;

  if (Math.random() < 0.5) {
    status = "error";
    errorDetails = "Random failure in service B";
  }

  const duration = new Date() - startTime;

  await axios.post("http://collector:4000/api/spans", {
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
    return res.status(500).json({ error: "failed" });
  }

  res.status(200).json({ ok: true });
});

app.listen(PORT, () => {
  console.log("Service B running on port", PORT);
});