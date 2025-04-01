import * as k8s from "@pulumi/kubernetes";

const namespace = new k8s.core.v1.Namespace("argocd", {
  metadata: { name: "argocd" },
});

const argocd = new k8s.helm.v3.Release("argocd", {
  chart: "argo-cd",
  version: "5.45.1",
  namespace: namespace.metadata.name,
  repositoryOpts: {
    repo: "https://argoproj.github.io/argo-helm",
  },
});

export const argocdNamespace = namespace.metadata.name;
