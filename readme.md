# Cluster Setup

This repository configures a kubernetes cluster with basic ingress, monitoring, and other services:

* RabbitMQ
* PostgreSQL
* Grafana
* Prometheus
* Traefik

The custom resource definitions and helms are created directly using the kubernetes cli, and the services are deployed using pulumi infrastructure as code tooling.

| Service | Ports |
|-------|-----------|
| service/monitoring-grafana | 80 |
| service/prometheus-operated | 9090 |
| service/psql | 5432 |
| service/rabbitmq | 5672, 15672  (HTTP) |
| service/traefik | 8000 (Dashboard), 8080 (IngressHTTP ), 4443 (Ingress HTTPS) |

| Service  | Internal DNS |
|-------|-----------|
| Postgres | psql.default.svc.cluster.local |
| RabbitMQ | rabbitmq.default.svc.cluster.local |

## How to run

In your minikube local cluster, run the following commands

```
make deploy-minikube
```

### RabbitMQ Credentials

| Secret  | Development value |
|-------|-----------|
| rabbitmqPassword | user |
| rabbitmqUser | admin |

### Postgres Credentials

| Secret  | Development value |
|-------|-----------|
| postgresUser | admin |
| postgresPassword | admin |