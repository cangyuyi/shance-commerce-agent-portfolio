const defaultGlobalRisks = [
  "全网第一",
  "最有效",
  "根治",
  "治疗",
  "减肥",
  "降血脂",
  "零风险",
  "永久",
  "增强免疫力",
  "无负担"
];

export function detectRisks(text, product, globalRisks = defaultGlobalRisks) {
  const terms = [...new Set([...globalRisks, ...(product.forbidden_claims || [])])];
  return terms.filter((term) => String(text).includes(term));
}

export function sanitizeText(text, risks) {
  let clean = String(text || "");
  for (const risk of risks) clean = clean.replaceAll(risk, "");
  return clean
    .replace(/[，、；]{2,}/g, "，")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function generateContent({ product, facts, request = "", goal = "detail" }) {
  if (!product) throw new Error("product is required");
  const factsList = Array.isArray(facts)
    ? facts.map(String).map((item) => item.trim()).filter(Boolean)
    : String(facts || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);

  if (!factsList.length) {
    return {
      decision: "human_review",
      reason: "insufficient_evidence",
      risks: [],
      copy: "",
      evidence: [],
      scores: null
    };
  }

  const risks = detectRisks(`${factsList.join("\n")}\n${request}`, product);
  const safeFacts = factsList.filter((fact) => detectRisks(fact, product).length === 0);
  const safeRequest = sanitizeText(request, risks);
  const points = (product.required_points || []).filter(
    (point) => safeFacts.join(" ").includes(point.keyword) || point.fallback
  );

  const ending = {
    detail: "把每一条信息说清楚，也把每一次选择留给你。",
    social: "不追逐夸张的惊喜，只分享刚刚好的日常体验。",
    live: "信息清楚、选择轻松，适合自己的才是好选择。"
  }[goal] || "把每一条信息说清楚，也把每一次选择留给你。";

  const opening = product.copy?.opening || `${product.name}，让商品信息更容易理解。`;
  const requestLine = safeRequest
    ? `围绕“${safeRequest.replace(/[。.]$/, "")}”展开，`
    : "";
  const body = points.slice(0, 3).map((point) => point.phrase).join("，");
  const copy = `${opening}${requestLine}${body}。${ending}`;

  const coverage = product.required_points?.length
    ? Math.round((points.length / product.required_points.length) * 100)
    : 100;
  const factuality = safeFacts.length >= 2 ? 96 : 86;
  const compliance = Math.max(76, 98 - risks.length * 7);
  const overall = Math.round(factuality * 0.35 + coverage * 0.3 + compliance * 0.35);

  const evidence = points.slice(0, 4).map((point, index) => ({
    selling_point: point.label,
    source: safeFacts[index % Math.max(1, safeFacts.length)] || "结构化商品输入"
  }));

  return {
    decision: risks.length ? "human_review" : "pass",
    reason: risks.length ? "risk_terms_removed" : "rule_checks_passed",
    product_id: product.id,
    product_name: product.name,
    goal,
    copy,
    risks,
    evidence,
    scores: {
      factuality,
      coverage,
      compliance,
      overall
    },
    disclaimer: "规则演示结果；正式发布前仍需人工复核。"
  };
}
