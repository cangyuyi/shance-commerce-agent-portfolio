import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const benchmark = JSON.parse(
  fs.readFileSync(path.join(root, "data", "benchmark.json"), "utf8")
);
const cases = JSON.parse(
  fs.readFileSync(path.join(root, "data", "eval_cases.json"), "utf8")
);

const weightedScore = (version) =>
  Math.round(
    benchmark.metrics.reduce(
      (sum, metric) => sum + version.scores[metric.key] * metric.weight,
      0
    ) / 100
  );

const riskDistribution = cases.reduce((result, item) => {
  result[item.risk] = (result[item.risk] || 0) + 1;
  return result;
}, {});

const rows = benchmark.versions.map((version) => ({
  version: version.id,
  name: version.name,
  declared: version.overall,
  calculated: weightedScore(version)
}));

const markdown = `# Benchmark 汇总

> ${benchmark.meta.disclaimer}

生成日期：${new Date().toISOString().slice(0, 10)}

## 数据集

- 案例数：${cases.length}
- 数据类型：${benchmark.meta.dataset_type}
- 结果类型：${benchmark.meta.result_type}

## 版本得分

| 版本 | 名称 | 声明分数 | 权重重算 |
|---|---|---:|---:|
${rows.map((row) => `| ${row.version} | ${row.name} | ${row.declared} | ${row.calculated} |`).join("\n")}

## 风险分布

| 风险类型 | 案例数 |
|---|---:|
${Object.entries(riskDistribution).map(([risk, count]) => `| ${risk} | ${count} |`).join("\n")}

## 结论

当前数据用于展示评测设计与计算链路。接入模型 API 后，应保留全部原始输入输出并用实测结果替换。
`;

fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(
  path.join(root, "reports", "benchmark-summary.md"),
  markdown,
  "utf8"
);

console.table(rows);
console.log(`Report: ${path.join(root, "reports", "benchmark-summary.md")}`);
