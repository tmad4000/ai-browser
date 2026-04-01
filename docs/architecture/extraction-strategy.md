# Extraction Strategy

Author: Codex
Date: 2026-03-31
Status: Proposed direction

## Core idea

This app should use a hybrid extraction strategy, not a single universal parser.

The app has multiple page shapes:

- article
- feed
- product
- search
- unknown

Each shape should have its own extraction path and only then flow into the LLM normalization layer.

## Target pipeline

1. Page load in `WebView`
2. Fast page classification
3. Page-type-specific extraction
4. LLM normalization into app schema
5. Native renderer output

## Page-type-specific extraction plan

### Article

Use a dedicated article parser:

- first choice if optimizing for lowest risk: Mozilla Readability
- first choice if optimizing for richer normalized content: `defuddle`

Extraction inputs to preserve:

- title
- byline
- publish date
- cleaned article body
- hero image
- JSON-LD
- meta tags

### Feed

Use site-specific extraction and item segmentation.

Extraction inputs to preserve:

- author
- handle
- avatar
- post text
- media
- engagement metrics
- timestamp
- permalink

### Product

Prefer structured data first.

Extraction inputs to preserve:

- JSON-LD product schema
- title
- brand
- price
- currency
- availability
- rating
- review count
- images
- specs

### Search

Extract result cards directly.

Extraction inputs to preserve:

- query
- result title
- result URL
- snippet
- favicon or site label
- featured snippet
- related searches

## Rules for the LLM layer

The LLM should:

- normalize extracted data into the app schema
- fill in light gaps using nearby evidence
- reject unsupported fields

The LLM should not:

- be responsible for cleaning whole pages from raw `body.innerText`
- infer page type from a giant noisy dump unless extraction failed

## Immediate repo changes that support this strategy

1. Fix search classification precedence in `lib/extraction/injected-scripts.ts`.
2. Stop mapping `unknown` to `article` in `lib/ai/prompt-builder.ts`.
3. Preserve more structured extraction fields before flattening to text.
4. Add an article-only parser behind the article branch.
5. Evaluate article quality on a fixed test set before picking Readability or `defuddle`.

## Decision

Recommended near-term decision:

- keep the current custom extraction backbone
- strengthen routing and structured extraction
- add a parser only for article pages

This is a better fit than trying to make `defuddle` own the whole stack.
