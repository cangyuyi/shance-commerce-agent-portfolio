import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node validate-dataset.mjs <dataset.json>");
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(file, "utf8"));
if (!Array.isArray(data) || data.length === 0) {
  throw new Error("Dataset must be a non-empty array.");
}

const ids = new Set();
for (const item of data) {
  if (!item.id) throw new Error("Every case requires an id.");
  if (ids.has(item.id)) throw new Error(`Duplicate id: ${item.id}`);
  ids.add(item.id);
}

console.log(`Validated ${data.length} cases.`);
