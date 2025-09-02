---
layout: post
title: Understanding Transformers — A Friendly Tour
date: 2025-09-02
tags: [ai, transformers, attention]
summary: An intuitive walk from tokens to attention heads with minimal math.
---

Transformers power modern AI systems, from translation to chatbots. This post takes a simple, practical look at how they work — no heavy math required.

<!--more-->

## Why transformers?

- Efficiency: Process sequences in parallel instead of step‑by‑step.
- Flexibility: Learn long‑range patterns without hand‑crafted features.
- Scalability: Works well across text, audio, images, and code.

## The core idea: Attention

“Pay attention to what matters.” Each token builds three vectors:

- Query (Q): What am I looking for?
- Key (K): What do I contain?
- Value (V): What information should I pass along?

The attention weight between token i and j is the similarity of `Q_i` and `K_j`, and we blend the corresponding `V_j` accordingly. Multiple heads let the model look for different patterns at once (syntax, long‑distance dependencies, etc.).

```python
# Toy attention (single head, not optimized)
import torch

def attention(x, d_k=64):
    Wq, Wk, Wv = [torch.nn.Linear(x.size(-1), d_k, bias=False) for _ in range(3)]
    Q, K, V = Wq(x), Wk(x), Wv(x)                 # [B, T, d_k]
    scores = Q @ K.transpose(-1, -2) / d_k**0.5   # [B, T, T]
    weights = torch.softmax(scores, dim=-1)       # rows sum to 1
    return weights @ V                            # [B, T, d_k]
```

## What to remember

- Attention = content‑based routing of information.
- Positional encodings add order awareness.
- Depth and width scale capability; data quality matters more than you think.

Further reading: [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/) · [minGPT](https://github.com/karpathy/minGPT)

