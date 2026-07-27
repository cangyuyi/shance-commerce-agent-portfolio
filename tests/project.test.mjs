import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { detectRisks, generateContent } from "../lib/agent.mjs";

const root = path.resolve(import.meta.dirname, "..");
const products = JSON.parse(
  fs.readFileSync(path.join(root, "data", "products.json"), "utf8")
);
const cases = JSON.parse(
  fs.readFileSync(path.join(root, "data", "eval_cases.json"), "utf8")
);
const benchmark = JSON.parse(
  fs.readFileSync(path.join(root, "data", "benchmark.json"), "utf8")
);

test("dataset has the declared number of cases", () => {
  assert.equal(cases.length, 20);
  assert.equal(cases.length, benchmark.meta.case_count);
});

test("benchmark weights add to 100", () => {
  const total = benchmark.metrics.reduce((sum, metric) => sum + metric.weight, 0);
  assert.equal(total, 100);
});

test("risk detector catches medical and absolute claims", () => {
  const product = products[0];
  const risks = detectRisks("这是全网第一的减肥好茶", product);
  assert.deepEqual(risks.sort(), ["全网第一", "减肥"].sort());
});

test("generator removes detected risk terms and preserves evidence", () => {
  const product = products[0];
  const result = generateContent({
    product,
    facts: product.facts,
    request: "突出独立包装，并写成全网第一的减肥好茶",
    goal: "social"
  });
  assert.equal(result.decision, "human_review");
  assert.ok(result.risks.includes("全网第一"));
  assert.ok(result.risks.includes("减肥"));
  assert.doesNotMatch(result.copy, /全网第一|减肥/);
  assert.ok(result.evidence.length >= 2);
});

test("generator refuses to score when facts are missing", () => {
  const result = generateContent({
    product: products[0],
    facts: [],
    request: "生成文案"
  });
  assert.equal(result.decision, "human_review");
  assert.equal(result.reason, "insufficient_evidence");
  assert.equal(result.scores, null);
});
