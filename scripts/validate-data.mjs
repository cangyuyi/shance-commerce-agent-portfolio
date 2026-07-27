import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const readJson = (file) =>
  JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

const products = readJson("data/products.json");
const cases = readJson("data/eval_cases.json");
const benchmark = readJson("data/benchmark.json");

const errors = [];
if (products.length < 4) errors.push("至少需要4个可交互商品样本");
if (cases.length !== benchmark.meta.case_count) {
  errors.push(`评测样本数 ${cases.length} 与 meta.case_count 不一致`);
}
if (benchmark.versions.length !== 3) errors.push("必须包含3个对照版本");
if (benchmark.metrics.length !== 7) errors.push("必须包含7项指标");

const metricKeys = new Set(benchmark.metrics.map((metric) => metric.key));
const totalWeight = benchmark.metrics.reduce((sum, metric) => sum + metric.weight, 0);
if (totalWeight !== 100) errors.push(`指标权重总和应为100，当前为${totalWeight}`);

for (const version of benchmark.versions) {
  for (const key of metricKeys) {
    const value = version.scores[key];
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      errors.push(`${version.id}.${key} 不是0-100之间的数字`);
    }
  }
  const weighted = Math.round(
    benchmark.metrics.reduce(
      (sum, metric) => sum + version.scores[metric.key] * metric.weight,
      0
    ) / 100
  );
  if (weighted !== version.overall) {
    errors.push(`${version.id} overall=${version.overall}，按权重计算应为${weighted}`);
  }
}

for (const product of products) {
  const required = ["id", "name", "category", "tone", "facts", "forbidden_claims", "required_points", "copy"];
  for (const key of required) {
    if (!(key in product)) errors.push(`${product.id || "unknown"} 缺少字段 ${key}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const summary = {
  verified_at: new Date().toISOString(),
  data_boundary: benchmark.meta.disclaimer,
  product_count: products.length,
  case_count: cases.length,
  version_count: benchmark.versions.length,
  metric_count: benchmark.metrics.length,
  weighted_scores: Object.fromEntries(
    benchmark.versions.map((version) => [
      version.id,
      Math.round(
        benchmark.metrics.reduce(
          (sum, metric) => sum + version.scores[metric.key] * metric.weight,
          0
        ) / 100
      )
    ])
  ),
  risk_distribution: cases.reduce((result, item) => {
    result[item.risk] = (result[item.risk] || 0) + 1;
    return result;
  }, {})
};

fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(
  path.join(root, "reports", "eval-summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
  "utf8"
);
console.log(
  `Validated ${products.length} products, ${cases.length} cases, ${benchmark.versions.length} versions, ${benchmark.metrics.length} metrics.`
);
