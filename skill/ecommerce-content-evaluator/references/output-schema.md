# 输出 Schema

```json
{
  "version": "string",
  "dataset_id": "string",
  "scores": {
    "factuality": 0,
    "coverage": 0,
    "compliance": 0,
    "brand": 0,
    "usability": 0,
    "format": 0,
    "workflow": 0,
    "overall": 0
  },
  "evidence": [],
  "bad_cases": [],
  "limitations": [],
  "publish_decision": "pass|human_review|block"
}
```

高风险、证据不足或格式失败时，`publish_decision` 不得为 `pass`。
