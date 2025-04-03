import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const argoNamespace = new k8s.core.v1.Namespace("argocd", {
  metadata: { name: "argocd" },
});

const argoCdDeployment = new k8s.apps.v1.Deployment("argocd-server", {
  metadata: {
    namespace: argoNamespace.metadata.name,
    name: "argocd-server",
  },
  spec: {
    selector: { matchLabels: { app: "argocd-server" } },
    replicas: 1,
    template: {
      metadata: { labels: { app: "argocd-server" } },
      spec: {
        containers: [
          {
            name: "argocd-server",
            image: "argoproj/argocd:v2.0.0",
            ports: [{ containerPort: 80 }],
          },
        ],
      },
    },
  },
});

const argoCdService = new k8s.core.v1.Service("argocd-server-service", {
  metadata: {
    namespace: argoNamespace.metadata.name,
    name: "argocd-server",
  },
  spec: {
    selector: { app: "argocd-server" },
    ports: [{ port: 80, targetPort: 80 }],
    type: "LoadBalancer",
  },
});

const argoCdApp = new k8s.apiextensions.CustomResource("my-app", {
  apiVersion: "argoproj.io/v1alpha1",
  kind: "Application",
  metadata: {
    namespace: argoNamespace.metadata.name,
    name: "my-app",
  },
  spec: {
    source: {
      repoURL: "https://gitlab.com/devops1914913/test3.git",
      targetRevision: "main",
      path: "./",
    },
    destination: {
      server: "https://kubernetes.default.svc",
      namespace: "default",
    },
    project: "default",
  },
});

export const argoCdUrl = argoCdService.status.loadBalancer.ingress[0].hostname;
