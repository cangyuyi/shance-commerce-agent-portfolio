import fs from "node:fs";
import path from "node:path";
import { generateContent } from "../lib/agent.mjs";

const root = path.resolve(import.meta.dirname, "..");
const products = JSON.parse(
  fs.readFileSync(path.join(root, "data", "products.json"), "utf8")
);

function readArg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

if (process.argv.includes("--help")) {
  console.log(`商策 Agent 规则演示器

Usage:
  npm run demo
  node scripts/demo-agent.mjs --product tea_001 --goal social --request "突出便携包装"

Goals:
  detail  商品详情页
  social  社交媒体
  live    直播卖点卡
`);
  process.exit(0);
}

const productId = readArg("product", products[0].id);
const product = products.find((item) => item.id === productId);
if (!product) {
  console.error(`Unknown product: ${productId}`);
  console.error(`Available: ${products.map((item) => item.id).join(", ")}`);
  process.exit(2);
}

const result = generateContent({
  product,
  facts: product.facts,
  request: readArg("request", product.default_request),
  goal: readArg("goal", "detail")
});

console.log(JSON.stringify(result, null, 2));
