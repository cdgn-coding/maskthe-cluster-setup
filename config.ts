import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
export const hasMonitoring = config.getBoolean("hasMonitoring") || false;

export const currentStack = pulumi.getStack();

const getBaseOptions = () => {
  if (currentStack != "prod") {
    return {};
  }

  const kubernetesStack = new pulumi.StackReference(config.require("kubernetesStack"));
  const kubeconfig = kubernetesStack.requireOutput("kubeconfig");
  const k8sProvider = new k8s.Provider("k8s", { kubeconfig: kubeconfig });
  return { provider: k8sProvider };
}

export const baseOptions = getBaseOptions();
