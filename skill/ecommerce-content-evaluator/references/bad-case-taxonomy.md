# Bad Case 分类

1. `input_missing`：关键输入缺失。
2. `input_conflict`：不同字段相互冲突。
3. `retrieval_miss`：未命中所需知识。
4. `retrieval_noise`：命中不相关或错误知识。
5. `generation_hallucination`：生成无依据事实。
6. `selling_point_omission`：遗漏必需卖点。
7. `policy_violation`：违规、功效或绝对化表述。
8. `brand_tone_mismatch`：不符合品牌语气。
9. `schema_failure`：结构无法解析。
10. `context_drift`：多轮修改后偏离原始事实。
11. `tool_failure`：工具调用超时、失败或返回异常。

每个 Bad Case 必须包含：样本ID、版本、问题现象、证据、根因、修复和复测结果。
