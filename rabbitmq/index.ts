import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const rabbitmqServiceName = "rabbitmq";
const rabbitmqUser = config.requireSecret("rabbitmqUser");
const rabbitmqPassword = config.requireSecret("rabbitmqPassword");

export const rabbitmqService = new kubernetes.apiextensions.CustomResource("rabbitmqService", {
    apiVersion: "rabbitmq.com/v1beta1",
    kind: "RabbitmqCluster",
    metadata: {
        name: rabbitmqServiceName,
    },
    spec: {
        rabbitmq: {
            additionalConfig: pulumi.interpolate`default_user=${rabbitmqUser}\ndefault_pass=${rabbitmqPassword}`
        },
    },
});

export const rabbitmqHost = `${rabbitmqServiceName}.default.svc.cluster.local`;

export const rabbitmqEndpoint = pulumi.interpolate`amqp://user:${rabbitmqPassword}@${rabbitmqServiceName}.default.svc.cluster.local:5672/`;

export const rabbitmqMonitoring = new kubernetes.apiextensions.CustomResource("rabbitmqMetrics", {
    apiVersion: "monitoring.coreos.com/v1",
    kind: "ServiceMonitor",
    metadata: {
        name: rabbitmqServiceName,
        labels: {
            release: "monitoring",
        }
    },
    spec: {
        endpoints: [
            {
                port: "prometheus",
                scheme: "http",
                interval: "15s",
                scrapeTimeout: "14s",
            },
            {
                port: "prometheus-tls",
                scheme: "https",
                interval: "15s",
                scrapeTimeout: "14s",
                tlsConfig: {
                    insecureSkipVerify: true,
                },
            },
            {
                port: "prometheus",
                scheme: "http",
                path: "/metrics/detailed",
                params: {
                    family: [
                        "queue_coarse_metrics",
                        "queue_metrics",
                    ],
                },
                interval: "15s",
                scrapeTimeout: "14s",
            },
            {
                port: "prometheus-tls",
                scheme: "https",
                path: "/metrics/detailed",
                params: {
                    family: [
                        "queue_coarse_metrics",
                        "queue_metrics",
                    ],
                },
                interval: "15s",
                scrapeTimeout: "14s",
                tlsConfig: {
                    insecureSkipVerify: true,
                },
            },
        ],
        selector: {
            matchLabels: {
                "app.kubernetes.io/component": "rabbitmq",
            },
        },
        namespaceSelector: {
            any: true,
        },
    },
}, {
    dependsOn: [rabbitmqService]
});
