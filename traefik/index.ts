import * as kubernetes from "@pulumi/kubernetes";

export const traefikDeployment = new kubernetes.apps.v1.Deployment("traefikDeployment", {
    kind: "Deployment",
    apiVersion: "apps/v1",
    metadata: {
        namespace: "default",
        name: "traefik",
        labels: {
            app: "traefik",
        },
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: {
                app: "traefik",
            },
        },
        template: {
            metadata: {
                labels: {
                    app: "traefik",
                },
            },
            spec: {
                serviceAccountName: "traefik-ingress-controller",
                containers: [{
                    name: "traefik",
                    image: "traefik:v2.9",
                    args: [
                      '--api.insecure',
                      '--accesslog',
                      '--entrypoints.web.Address=:8000',
                      '--entrypoints.websecure.Address=:4443',
                      '--providers.kubernetescrd',
                      '--certificatesresolvers.myresolver.acme.tlschallenge',
                      '--certificatesresolvers.myresolver.acme.email=foo@you.com',
                      '--certificatesresolvers.myresolver.acme.storage=acme.json',
                      // Please note that this is the staging Let's Encrypt server.
                      // Once you get things working, you should remove that whole line altogether.
                      '--certificatesresolvers.myresolver.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory',
                    ],
                    ports: [
                        {
                            name: "web",
                            containerPort: 8000,
                        },
                        {
                            name: "websecure",
                            containerPort: 4443,
                        },
                        {
                            name: "admin",
                            containerPort: 8080,
                        },
                    ],
                }],
            },
        },
    },
});

export const traefikService = new kubernetes.core.v1.Service("traefikService", {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
        name: "traefik",
    },
    spec: {
        ports: [
            {
                protocol: "TCP",
                name: "web",
                port: 8000,
            },
            {
                protocol: "TCP",
                name: "admin",
                port: 8080,
            },
            {
                protocol: "TCP",
                name: "websecure",
                port: 4443,
            },
        ],
        selector: {
            app: "traefik",
        },
    },
}, {
    dependsOn: traefikDeployment
});

export const traefikEndpoint = traefikService.spec.clusterIP || traefikService.status.loadBalancer.ingress[0].ip;