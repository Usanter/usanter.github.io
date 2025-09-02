---
layout: post
title: Small LLMs on a Budget — Practical Tips
date: 2025-09-02
tags: [ai, llm, efficiency, inference]
summary: Running, fine-tuning, and serving compact models without drama.
---

Big models are flashy, but small ones often win in cost, latency, and privacy. Here’s a practical checklist to get strong results with compact LLMs.

<!--more-->

## Pick the right base

- Prefer instruction‑tuned variants when you need out‑of‑the‑box helpfulness.
- Evaluate on your tasks, not benchmarks alone (latency + accuracy).
- Watch license terms if you plan to ship commercially.

## Squeeze memory and latency

- Quantization: 8‑bit (safe), 4‑bit (aggressive) for most layers.
- KV‑cache: Essential for long prompts and streaming responses.
- Flash‑attention or fused kernels: Big gains on longer sequences.

```python
# LoRA + 4-bit loading (HF + PEFT)
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model

model_id = "some-small-llm"
tok = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    load_in_4bit=True,
    device_map="auto",
)

conf = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05, target_modules=["q_proj","v_proj"])
model = get_peft_model(model, conf)
```

## Fine‑tune efficiently

- LoRA/QLoRA: Adapt capability with a few million trainable params.
- Use small, curated datasets; synthetic data helps but needs filtering.
- Early stopping + small eval sets keep you honest and cheap.

## Serve simply

- Batch small requests; cap max tokens and temperature.
- Cache prompts/responses; reuse KV where safe.
- Monitor tail latency — it hurts UX more than you think.

## When to go bigger

- Safety policies or tool‑use that smaller models fail consistently.
- Complex multi‑step tasks where reasoning depth dominates.
- Multilingual or domain breadth beyond your data.

Small models shine when product constraints matter: fast, cheap, private. Start small, measure, and only scale up if the data says so.

