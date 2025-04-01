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

const myAppDeployment = new k8s.apps.v1.Deployment("my-app-deployment", {
  metadata: { namespace: namespace.metadata.name },
  spec: {
    replicas: 1,
    selector: { matchLabels: { app: "my-app" } },
    template: {
      metadata: { labels: { app: "my-app" } },
      spec: {
        containers: [
          {
            name: "my-app",
            image: "my-app-image:v1",
            ports: [{ containerPort: 3000 }],
            livenessProbe: {
              httpGet: { path: "/healthz", port: 3000 },
              initialDelaySeconds: 3,
              periodSeconds: 10,
            },
            readinessProbe: {
              httpGet: { path: "/healthz", port: 3000 },
              initialDelaySeconds: 3,
              periodSeconds: 5,
            },
            startupProbe: {
              httpGet: { path: "/healthz", port: 3000 },
              failureThreshold: 30,
              periodSeconds: 10,
            },
          },
        ],
      },
    },
  },
});

const myAppService = new k8s.core.v1.Service("my-app-service", {
  metadata: {
    namespace: namespace.metadata.name,
    name: "my-app-service",
  },
  spec: {
    selector: { app: "my-app" },
    ports: [{ port: 80, targetPort: 3000 }],
    type: "LoadBalancer",
  },
});

const myAppIngress = new k8s.networking.v1.Ingress("my-app-ingress", {
  metadata: {
    namespace: namespace.metadata.name,
    name: "my-app-ingress",
  },
  spec: {
    rules: [
      {
        host: "my-app.local",
        http: {
          paths: [
            {
              path: "/",
              pathType: "Prefix",
              backend: {
                service: {
                  name: myAppService.metadata.name,
                  port: { number: 80 },
                },
              },
            },
          ],
        },
      },
    ],
  },
});

export const appUrl = "http://my-app.local";
