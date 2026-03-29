# Distributed Tracing System (Microservices + Prometheus)

## Overview

This project implements a Distributed Tracing System using microservices architecture. It demonstrates how a request flows across multiple services (Gateway → Service A → Service B) while capturing and visualizing trace data.

The system includes:

- API Gateway (entry point)
- Service A (fast processing)
- Service B (slow + failure simulation)
- Span Collector (stores traces)
- Frontend UI (Jaeger-like timeline)
- Prometheus (metrics monitoring)

---

## Architecture Diagram
```
                ┌──────────────┐
                │   Frontend   │
                │ (Port 5000)  │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │   Gateway    │
                │ (Port 3000)  │
                └──────┬───────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌──────────────┐              ┌──────────────┐
│  Service A   │              │  Service B   │
│ (Port 3001)  │              │ (Port 3002)  │
└──────┬───────┘              └──────┬───────┘
       │                              │
       └──────────────┬───────────────┘
                      ▼
              ┌──────────────┐
              │  Collector   │
              │ (Port 4000)  │
              └──────┬───────┘
                     ▼
              ┌──────────────┐
              │ Prometheus   │
              │ (Port 9090)  │
              └──────────────┘
```
---

## Features

 Distributed tracing using W3C traceparent header
 Parallel service calls (Service A & B)
 Error simulation (Service B fails randomly)
 Span collection & storage
 Trace visualization (timeline / flame graph)
 Prometheus metrics ("/metrics")
 Docker-based orchestration
 Health checks for all services

---

## API Endpoints

### Gateway

POST /api/go

- Starts a new trace
- Calls Service A & B
- Returns "{ "status": "ok" }"

---

### Service A

POST /work

- Delay: 50–200 ms
- Always success

---

### Service B

POST /work

- Delay: 100–500 ms
- 20% failure rate

---

### Collector
```
POST /api/spans
GET  /api/traces
GET  /api/traces/{traceId}
```
---

### Metrics

GET /metrics

Available on:

- Gateway
- Service A
- Service B

---

### Example Metrics

http_requests_total{service="gateway",method="POST",path="/api/go",status="200"} 5

http_request_duration_seconds_bucket{service="gateway",le="0.5"} 3

---

### Frontend Features

- Trace list view
- Clickable trace IDs
- Timeline visualization
- Error spans shown in red
- data-testid attributes for testing

---

## Running the Project

1️ Clone repository
```
git clone <your-repo-url>
```
```
cd distributed-tracing-system
```

---

2️ Start services
```
docker compose up --build
```
---

3️ Access applications
```
Service| URL
Frontend| http://localhost:5000
Gateway| http://localhost:3005
Collector| http://localhost:4000
Prometheus| http://localhost:9090
```
---

### Testing

Generate trace
```
curl -X POST http://localhost:3005/api/go
```
---

Get traces
```
curl http://localhost:4000/api/traces
```
---

Metrics
```
curl http://localhost:3005/metrics
```
---

## Traceparent Format

00-{traceId}-{spanId}-01

Example:
```
00-abc123def4567890-xyz987654321-01
```
---

## Project Structure
```
distributed-tracing-system/
│
├── gateway/
├── service-a/
├── service-b/
├── collector/
├── frontend/
│
├── docker-compose.yml
├── prometheus.yml
├── .env.example
└── README.md
```

---

## Conclusion

This project demonstrates a complete distributed tracing system with:

- Observability
- Monitoring
- Visualization
