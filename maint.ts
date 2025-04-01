import * as cdk8s from "cdk8s";
import * as k8s from "cdk8s-plus-22";
import { Construct } from "constructs";

export class MyAppK8s extends cdk8s.Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const namespace = new k8s.Namespace(this, "my-app-namespace", {
      metadata: { name: "my-app" },
    });

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

    new k8s.Service(this, "my-app-service", {
      metadata: { name: "my-app-service" },
      spec: {
        ports: [{ port: 80 }],
        selector: { app: "my-app" },
      },
      namespace: namespace.name,
    });

    new k8s.Ingress(this, "my-app-ingress", {
      metadata: { name: "my-app-ingress" },
      rules: [
        {
          host: "my-app.local",
          spec: {
            paths: [
              {
                path: "/startup",
                pathType: k8s.HttpIngressPathType.PREFIX,
                backend: {
                  service: {
                    name: "my-app-service",
                    port: { number: 80 },
                  },
                },
              },
            ],
          },
        },
      ],
      namespace: namespace.name,
    });
  }
}

const app = new cdk8s.App();
new MyAppK8s(app, "my-app-chart");
app.synth();
