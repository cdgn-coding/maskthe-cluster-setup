import * as kx from "@pulumi/kubernetesx";
import * as pulumi from "@pulumi/pulumi";

export const createService = (args: {name: string, serviceSpecs: {}, metadata: {}}, deployment: kx.Deployment, opts = {}) => {
    const { name, serviceSpecs, metadata } = args;

    const serviceSpec = pulumi
        .all([deployment.spec.template.spec.containers, serviceSpecs])
        .apply(([containers, serviceSpecs]) => {
            // TODO: handle merging ports from serviceSpecs
            const ports = {};
            containers.forEach(container => {
                if (container.ports) {
                    container.ports.forEach(port => {
                        // @ts-ignore
                        ports[port.name] = port.containerPort;
                    });
                }
            });

            return Object.assign(
                Object.assign({}, serviceSpecs), {
                    // @ts-ignore
                    ports: serviceSpecs.ports || ports,
                    selector: deployment.spec.selector.matchLabels,
                    // @ts-ignore
                    type: serviceSpecs && serviceSpecs.type
                });
        });
    return new kx.Service(name, {
        metadata: {
            namespace: deployment.metadata.namespace,
            ...metadata
        },
        spec: serviceSpec,
    }, opts);
}