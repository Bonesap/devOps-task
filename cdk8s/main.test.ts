import { MyChart } from "./main";
import { Testing } from "cdk8s";

describe("Placeholder", () => {
  test("Empty", () => {
    const app = Testing.app();
    const chart = new MyChart(app, "test-chart", "my-app");
    const results = Testing.synth(chart);
    expect(results).toMatchSnapshot();
  });
});
