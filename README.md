# Distributed Tracing System

Microservices + Prometheus + Observability

---

## Overview

This project implements a **Distributed Tracing System** using a microservices architecture. It demonstrates how a request flows across multiple services while capturing, storing, and visualizing trace data.

The system simulates real-world observability using tracing, monitoring, and visualization tools.

---

## System Components

* API Gateway – Entry point for all requests
* Service A – Fast processing service
* Service B – Slow service with failure simulation
* Span Collector – Stores and manages trace data
* Frontend UI – Visualizes traces (Jaeger-like UI)
* Prometheus – Metrics collection and monitoring

---

## Architecture

```
Frontend (5000)
      │
      ▼
Gateway (3000)
      │
 ┌────┴────┐
 ▼         ▼
Service A  Service B
(3001)     (3002)
      │
      ▼
Collector (4000)
      │
      ▼
Prometheus (9090)
```

---

## Key Features

* Distributed tracing using W3C `traceparent` header
* Parallel service calls (Service A and Service B)
* Failure simulation (Service B – 20% error rate)
* Centralized span collection
* Trace visualization (timeline / flame graph)
* Prometheus metrics (`/metrics`)
* Docker-based deployment
* Health checks for all services

---

## API Endpoints

### Gateway

```
POST /api/go
```

* Starts a new trace
* Calls Service A and Service B
* Returns:

```json
{ "status": "ok" }
```

---

### Service A

```
POST /work
```

* Delay: 50–200 ms
* Always successful

---

### Service B

```
POST /work
```

* Delay: 100–500 ms
* 20% failure rate

---

### Collector

```
POST /api/spans
GET  /api/traces
GET  /api/traces/{traceId}
```

---

### Metrics

```
GET /metrics
```

Available on:

* Gateway
* Service A
* Service B

Example:

```
http_requests_total{service="gateway",method="POST",path="/api/go",status="200"} 5
```

---

## Frontend Features

* Trace list view
* Clickable trace IDs
* Timeline visualization
* Error spans highlighted in red
* data-testid support for testing

---

## Running the Project

### 1. Clone Repository

```bash
git clone https://github.com/Laharisrikotipalli/distributed-tracing-system.git
cd distributed-tracing-system
```

---

### 2. Start Services

```bash
docker compose up --build
```

---

### 3. Access Applications

| Service    | URL                   |
| ---------- | --------------------- |
| Frontend   | http://localhost:5000 |
| Gateway    | http://localhost:3000 |
| Collector  | http://localhost:4000 |
| Prometheus | http://localhost:9090 |

---

## Testing

### Generate Trace

```bash
curl -X POST http://localhost:3000/api/go
```

---

### Get All Traces

```bash
curl http://localhost:4000/api/traces
```

---

### Metrics

```bash
curl http://localhost:3000/metrics
```

---

## Trace Format

```
00-{traceId}-{spanId}-01
```

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

## Learning Outcomes

* Microservices communication
* Distributed tracing concepts
* Observability (tracing and metrics)
* Docker-based system design
* Monitoring using Prometheus

---

## Future Improvements

* Integrate Jaeger or Zipkin
* Add persistent storage (MongoDB/PostgreSQL)
* Add authentication and security
* Deploy on AWS (EC2 with Docker)
* Add Grafana dashboards

---

## Conclusion

This project demonstrates a complete observability pipeline by combining:

* Tracing for request flow tracking
* Monitoring for metrics collection
* Visualization through a user interface

It serves as a practical implementation of modern cloud-native system design.

---
