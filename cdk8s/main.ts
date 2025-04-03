import { Construct } from "constructs";
import { App, Chart } from "cdk8s";
import {
  KubeDeployment,
  KubeService,
  KubeIngress,
  KubeNamespace,
  IntOrString,
} from "./imports/k8s";

export class MyChart extends Chart {
  constructor(scope: Construct, ns: string, appLabel: string) {
    super(scope, ns);

    const namespace = new KubeNamespace(this, "my-app-namespace", {
      metadata: { name: "my-app" },
    });

    new KubeDeployment(this, "my-app-deployment", {
      metadata: {
        name: "my-app",
        namespace: namespace.name,
      },
      spec: {
        replicas: 2,
        selector: {
          matchLabels: { app: appLabel },
        },
        template: {
          metadata: { labels: { app: appLabel } },
          spec: {
            containers: [
              {
                name: "my-app",
                image: "bonesap/my-express-app:latest",
                ports: [{ containerPort: 80 }],
                readinessProbe: {
                  httpGet: {
                    path: "/healthz",
                    port: IntOrString.fromNumber(80),
                  },
                  initialDelaySeconds: 5,
                  periodSeconds: 10,
                },
                livenessProbe: {
                  httpGet: {
                    path: "/healthz",
                    port: IntOrString.fromNumber(80),
                  },
                  initialDelaySeconds: 15,
                  periodSeconds: 20,
                },
                startupProbe: {
                  httpGet: {
                    path: "/healthz",
                    port: IntOrString.fromNumber(80),
                  },
                  initialDelaySeconds: 10,
                  periodSeconds: 5,
                  failureThreshold: 30,
                },
              },
            ],
          },
        },
      },
    });

    new KubeService(this, "my-app-service", {
      metadata: {
        name: "my-app-service",
        namespace: namespace.name,
      },
      spec: {
        ports: [{ port: 80 }],
        selector: { app: appLabel },
      },
    });

    new KubeIngress(this, "my-app-ingress", {
      metadata: {
        name: "my-app-ingress",
        namespace: namespace.name,
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
                      name: "my-app-service",
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
  }
}

const app = new App();
new MyChart(app, "getting-started", "my-app");

app.synth();
