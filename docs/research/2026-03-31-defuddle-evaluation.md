# Defuddle Evaluation for AI Browser

Author: Codex
Date: 2026-03-31
Status: Research note

## Why this note exists

This document saves Codex research on whether `defuddle` is the right extraction tool for this project.

Short answer: `defuddle` is not the best top-level extraction tool for the whole app, but it is a strong candidate for the article-specific path.

## Project context observed in this repo

The current app is not a simple reader mode clone. It is trying to:

- load arbitrary pages in a React Native `WebView`
- classify pages into `feed`, `search`, `product`, `article`, or `unknown`
- extract page content in-page
- send that content to an LLM
- render native UI for each schema type

Relevant local files:

- `components/browser/BrowserView.tsx`
- `lib/extraction/injected-scripts.ts`
- `lib/extraction/content-processor.ts`
- `lib/ai/prompt-builder.ts`

## What `defuddle` is good at

`defuddle` is built for main-content extraction and cleanup, especially article-style pages. Its documented strengths include:

- extracting main content from a page or HTML
- returning cleaned HTML or Markdown
- extracting metadata, including schema.org data
- offering debug output for why nodes were removed

Primary source:

- GitHub: https://github.com/kepano/defuddle

Relevant notes from the upstream docs:

- positioned as a replacement for Mozilla Readability for content extraction
- browser and Node usage are both supported
- latest GitHub release observed during this research: `0.15.0` on March 31, 2026

## Why `defuddle` is not the best single tool for this app

The app needs more than article extraction.

### 1. The product surface is multi-shape, not article-only

This app renders dedicated views for:

- feeds
- articles
- products
- search results

`defuddle` is primarily an article-content cleaner. It will not be the core answer for feed timelines, ecommerce pages, or SERPs.

### 2. The current problems look more architectural than library-related

The present extraction logic is intentionally coarse:

- `extractMainContent()` mostly pulls `main`, `article`, or fallback `body.innerText`
- feed extraction is host/selector-specific
- the LLM is asked to normalize large noisy text blobs into structured schemas

That means a lot of failure risk currently comes from:

- weak page classification
- noisy extraction boundaries
- over-reliance on the LLM to recover structure after extraction

Swapping in `defuddle` globally does not solve those problems.

### 3. `defuddle` would be a runtime fit only for part of the flow

This app extracts inside a React Native `WebView`, not in a normal browser extension architecture and not in a Node crawler. `defuddle` can still be used, but it fits best as a targeted article parser, not as the app's single extraction backbone.

## Current repo issues worth fixing before any library swap

### Search classification bug

In `lib/extraction/injected-scripts.ts`, the search condition currently mixes `&&` and `||` without grouping:

- `searchHosts.some(...) && url.includes('search') || url.includes('?q=')`

That means any URL with `?q=` can be labeled as `search` even if it is not a search engine result page.

### Unknown pages default to article

In `lib/ai/prompt-builder.ts`, unknown content types fall back to the article schema. That forces ambiguous or noisy pages down the wrong path and raises the burden on the LLM.

### Extraction is mostly text-first, not structure-first

The current extractor keeps some metadata and JSON-LD, but the main body is mostly `innerText`. That is acceptable as a baseline, but it throws away structure that would help the schema conversion step.

## Comparison

### Defuddle

Best for:

- article pages
- markdown output
- metadata extraction
- debug visibility into cleanup decisions

Weak fit for:

- feeds
- search result pages
- product pages
- being the only extraction layer for the app

### Mozilla Readability

Best for:

- conservative and battle-tested article extraction
- reader-mode style main-content parsing
- a smaller, more established baseline for article-only cleanup

Primary source:

- GitHub: https://github.com/mozilla/readability

Weak fit for:

- feeds
- search result pages
- products
- richer article normalization beyond core reader-mode extraction

## Better idea

The better idea is not "pick one parser." The better idea is a hybrid extraction pipeline.

### Recommended architecture

1. Keep custom page routing and classification.
2. Improve page typing so `feed`, `search`, `product`, `article`, and `unknown` are decided more reliably.
3. Use page-type-specific extraction:
   - feeds: site-specific selectors and timeline item extraction
   - search: result-card extraction and query/snippet parsing
   - product: JSON-LD + page selectors for price, rating, availability, images
   - article: article parser such as Readability or `defuddle`
4. Pass structured extraction artifacts to the LLM, not just a giant text dump.
5. Let the LLM do normalization and gap-filling, not primary cleanup.

### Practical recommendation for this repo

#### Option A: conservative path

Use Mozilla Readability only for pages already classified as `article` or "probably readerable." Keep the rest of the pipeline custom.

Why:

- lowest-risk change
- battle-tested article path
- avoids overcommitting to an article parser for non-article pages

#### Option B: richer article path

Use `defuddle` only for the article branch if the team values:

- markdown output
- richer metadata
- more standardized handling of callouts, code blocks, footnotes, and math
- better debug information

Why:

- stronger article UX than a plain text extractor
- still avoids using `defuddle` where it does not fit

## Recommendation

Recommended direction for this project:

- do not adopt `defuddle` as the universal extraction layer
- first fix classification and extraction-boundary problems in the current pipeline
- then add an article-only parser behind the `article` path
- start with Readability if the goal is safety and speed
- choose `defuddle` for the article branch if markdown quality and normalized article content are important enough to justify the extra integration complexity

## Suggested next implementation steps

1. Fix the search classification precedence bug.
2. Stop defaulting `unknown` pages to the article schema.
3. Expand extraction payloads to preserve more structure per page type.
4. Add an article parser only on the article path.
5. Compare article output quality on a small page set before committing to Readability or `defuddle`.

## Research provenance

This note was produced from Codex research and local codebase inspection on 2026-03-31.
