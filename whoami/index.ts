import * as kubernetes from "@pulumi/kubernetes";

export const defaultWhoamiDeployment = new kubernetes.apps.v1.Deployment("defaultWhoamiDeployment", {
    kind: "Deployment",
    apiVersion: "apps/v1",
    metadata: {
        namespace: "default",
        name: "whoami",
        labels: {
            app: "whoami",
        },
    },
    spec: {
        replicas: 2,
        selector: {
            matchLabels: {
                app: "whoami",
            },
        },
        template: {
            metadata: {
                labels: {
                    app: "whoami",
                },
            },
            spec: {
                containers: [{
                    name: "whoami",
                    image: "traefik/whoami",
                    ports: [{
                        name: "web",
                        containerPort: 80,
                    }],
                }],
            },
        },
    },
});

export const whoamiService = new kubernetes.core.v1.Service("whoamiService", {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
        name: "whoami",
    },
    spec: {
        ports: [{
            protocol: "TCP",
            name: "web",
            port: 80,
        }],
        selector: {
            app: "whoami",
        },
    },
}, {
    dependsOn: defaultWhoamiDeployment
});

export const whoamiIngress = new kubernetes.apiextensions.CustomResource("whoami-ingress", {
    apiVersion: "traefik.containo.us/v1alpha1",
    kind: "IngressRoute",
    metadata: {
        name: "simpleingressroute",
        namespace: "default",
    },
    spec: {
        entryPoints: [
            "web",
        ],
        routes: [
            {
                match: "PathPrefix(`/whoami`)",
                kind: "Rule",
                services: [
                    {
                        name: "whoami",
                        port: 80,
                    },
                ],
            },
        ],
    },
}, {
    dependsOn: whoamiService
})
