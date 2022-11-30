import * as kubernetes from "@pulumi/kubernetes";
import { baseOptions, currentStack } from "../config";

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
                      '--certificatesresolvers.myresolver.acme.httpchallenge.entrypoint=web',
                      '--certificatesresolvers.myresolver.acme.email=webmaster@maskthe.email',
                      '--certificatesresolvers.myresolver.acme.storage=acme.json',
                      // Please note that this is the staging Let's Encrypt server.
                      // Once you get things working, you should remove that whole line altogether.
                      // '--certificatesresolvers.myresolver.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory',
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
}, baseOptions);

const getTraefikServiceType = () => {
    if (currentStack === "dev") {
        return kubernetes.core.v1.ServiceSpecType.ClusterIP;
    }
    
    return kubernetes.core.v1.ServiceSpecType.LoadBalancer;
}

const getTraefikServicePorts = () => {
    if (currentStack === "dev") {
        return [
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
        ];
    }
    
    return [
        {
            protocol: "TCP",
            name: "web",
            port: 80,
            targetPort: 8000,
        },
    ];
}

export const traefikService = new kubernetes.core.v1.Service("traefikService", {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
        name: "traefik",
    },
    spec: {
        type: getTraefikServiceType(),
        ports: getTraefikServicePorts(),
        selector: {
            app: "traefik",
        },
    },
}, {
    ...baseOptions,
    dependsOn: traefikDeployment
});

const getTraefikEndpoint = () => {
    if (currentStack === "dev") {
        return traefikService.spec.clusterIP
    }
    
    return traefikService.status.loadBalancer.ingress[0].ip;
}

export const traefikEndpoint = getTraefikEndpoint();