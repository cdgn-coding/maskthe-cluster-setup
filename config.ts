import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const kubernetesStack = new pulumi.StackReference(config.require("kubernetesStack"));

const kubeconfig = kubernetesStack.requireOutput("kubeconfig");
export const k8sProvider = new k8s.Provider("k8s", { kubeconfig: kubeconfig });
export const baseOptions = { provider: k8sProvider };