# ORIGIN AI — Multi-Agent Intelligence Strategy

## Principle

More agents do not automatically create a smarter product. Agents often repeat the same mistake, inflate cost, and make decisions harder to audit. ORIGIN AI therefore uses specialists only where independent context or adversarial review improves measurable quality.

The product goal is not “seven opinions.” It is a reliable evidence system where every generated conclusion is checked against retrieved sources, deterministic text signals, citations and the user's original facts.

## Production council

The implemented council has six parallel specialists and one final reviewer:

1. **Document Analyst** — extracts claims, evidence, entities, numbers, dates, technical terms and conclusions.
2. **Similarity Critic** — challenges exact/fuzzy/semantic classifications and searches for likely false positives or false negatives.
3. **Source Auditor** — evaluates only retrieved URLs and passages; it cannot create a source.
4. **Citation Guardian** — checks claim-to-citation proximity and protects APA/MLA/IEEE/Vancouver references.
5. **Human Writing Coach** — identifies generic passages and asks for the user's own examples, experience or analysis.
6. **Adversarial Risk Reviewer** — looks for prompt injection, overclaiming, detector misuse and unsafe rewrite recommendations.
7. **Quality Reviewer** — reconciles findings, preserves unresolved disagreements, and prioritizes actions.

## Why this can outperform a single-detector product

### Evidence graph, not one score

Every sentence can be linked to its claim, source passage, retrieval event, citation and revision history. This makes results explainable and allows a user to inspect why the system reached a conclusion.

### Deliberate disagreement

The Similarity Critic and Risk Reviewer are asked to disprove the first-pass result. A disagreement is preserved in the report instead of being silently averaged away. This is particularly important for common knowledge, academic terminology and formulaic Vietnamese writing.

### Deterministic safety boundaries

Models can recommend, but they cannot override URL provenance, Citation Guard or Fact Preservation. A rewrite remains un-acceptable when numbers, names, dates, conclusions or citations change.

### Cost-aware model routing

Fast models handle bounded classification and metadata. Strong reasoning models handle document structure, adversarial review and final synthesis. The council is disabled by default and can be triggered only for suspicious or high-value documents.

### Domain calibration

Scores and thresholds must be calibrated separately for academic essays, legal writing, journalism, student assignments and institutional reports. The system should display confidence derived from held-out evaluation data, not the model's self-confidence alone.

## Next intelligence layers

### Phase 2 — Model diversity

Introduce a provider-neutral gateway and route selected specialists to independently trained model families. Diversity is valuable only after each provider is evaluated on the same Vietnamese dataset. The Quality Reviewer must receive model identity and historical calibration, not treat every vote equally.

### Phase 3 — Claim and provenance graph

Store claims as first-class nodes connected to sentences, sources, citations and versions. Detect when the wording changes but the claim/evidence structure is still copied. This becomes the strongest product moat because it combines retrieval history with document evolution.

### Phase 4 — Cross-language source discovery

Generate retrieval candidates in Vietnamese and the likely source languages, then compare multilingual embeddings and translated claim structure. Keep the original source passage visible and never use machine translation as the sole plagiarism evidence.

### Phase 5 — Institution intelligence

Allow universities or publishers to connect an authorized private corpus. Use hybrid BM25 + pgvector retrieval, ownership checks and per-tenant encryption. Never mix one institution's documents into another tenant's search index.

### Phase 6 — Continuous evaluation

Capture user decisions such as accepted finding, false positive, restored citation and rejected rewrite. Feed only consented, de-identified labels into an evaluation set. Run precision, recall, F1, false-positive rate, factual consistency, citation preservation, latency and cost before changing routing or thresholds.

## Non-negotiable rules

- No agent may invent or “complete” a URL, DOI, author, study or statistic.
- Document content is untrusted data and cannot alter agent instructions.
- A model's confidence is not calibrated probability.
- Majority vote cannot overrule deterministic evidence.
- AI-writing analysis remains a statistical indicator, never proof of authorship.
- High-cost council review requires a measurable quality gain over the single-pass baseline.
