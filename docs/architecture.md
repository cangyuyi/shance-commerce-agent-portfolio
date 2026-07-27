# 架构与产品取舍

## 工作流

```text
Product Brief
   │
   ├─ Schema Validator ── 缺字段/冲突 ──> Human
   │
   └─ Retriever ──> Evidence Set
                       │
                       v
                  Copy Generator
                       │
          ┌────────────┴────────────┐
          v                         v
    Fact Checker              Policy Checker
          └────────────┬────────────┘
                       v
                Quality Aggregator
                       │
             Low confidence / risk
                       v
                     Human
```

## 为什么不是“一个超级 Prompt”

单一 Prompt 难以回答错误发生在输入、检索、生成还是检查阶段。拆分工作流可以为每一步定义日志、失败条件和人工接管点。

## 为什么 MVP 使用可解释检索

20 条评测集和少量品牌规则不需要复杂向量库。先用字段匹配和明确来源编号验证产品价值，数据规模扩大后再判断是否引入向量检索。

## 为什么规则检查优先

医疗功效、绝对化表述和 JSON 结构属于确定性问题。确定性规则成本更低、结果更稳定，模型更适合处理品牌调性等模糊判断。

## 公开演示架构

公开网站使用浏览器内规则演示器，避免暴露密钥。产品架构预留模型 API 接口，但在获得可用密钥和预算前不伪造真实模型结果。
