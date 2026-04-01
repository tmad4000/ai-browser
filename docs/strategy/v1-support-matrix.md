# V1 Web Surface Support Matrix

Author: Codex
Date: 2026-03-31
Status: Proposed v1 scope

## Purpose

This document defines which webpage formats this product should support first, with XFeedParadise as the anchoring use case.

The goal is not to "support the web." The goal is to support the user loop that matters:

1. discover something in a feed
2. open the post or thread
3. inspect the linked source
4. persist useful entities and relationships
5. move fluidly back to discovery

That loop determines scope.

## Guiding principle

Support the surfaces that let a user move from social discovery to source understanding with minimal context loss.

Do not promise universal webpage understanding.

## Support matrix

| Format | XFeedParadise critical | Phase | User job | Extraction goal | Primary fields | Rendering target | Confidence bar |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Social feed / timeline | Yes | Ship now | Scan many items quickly and decide what matters | Segment feed into distinct items with stable identity and ranking context | item id, author, handle, avatar, text, media, engagement, timestamp, permalink, outbound links, promoted flag | Native feed list | High precision on item boundaries; medium recall on secondary metadata |
| Social post / thread detail | Yes | Ship now | Understand one conversation deeply | Extract root post plus reply / repost / quote structure | post id, author, text, media, timestamp, engagement, reply tree, quoted target, outbound links | Native thread view | High precision on conversation structure for supported sites |
| Linked article / blog / news page | Yes | Ship now | Read the source behind a feed item | Extract clean main content and article metadata | canonical URL, title, subtitle, authors, published date, updated date, hero image, body blocks, tags, source | Native article reader | High precision on title/body; graceful fallback if metadata is partial |
| Profile page | Yes | Ship now | Decide whether an account is worth following / inspecting | Extract profile identity and summary facts | name, handle, avatar, bio, verified flag, links, follower/following stats, joined date, pinned content | Native profile summary | Medium precision acceptable if core identity is correct |
| Link preview target / generic destination page | Yes | Ship now | Open a linked page even when it is not a perfect article | Extract enough metadata to classify or preview the destination | canonical URL, page title, site name, description, hero image, content type guess, dominant entities | Native preview card / fallback raw view | Medium confidence acceptable; must not misclassify aggressively |
| Search results page | No | Later | Triage the web from a query | Segment result cards and featured snippets | query, result title, result URL, snippet, site label, featured snippet, related searches | Native results list | High precision on result boundaries required |
| Product page | No | Later | Inspect commercial pages linked from feeds or search | Extract structured commercial facts | product id, name, brand, price, currency, availability, rating, review count, images, specs | Native product page | High precision on price/availability required |
| Newsletter / long-form email archive | No | Later | Read creator content behind feed links | Treat as article with stronger metadata handling | title, author, issue date, body blocks, series metadata | Native article reader | Same as article |
| Forum / discussion thread | No | Later | Read multi-party discussion on the source site | Extract post hierarchy and accepted answer signals | thread title, posts, authors, timestamps, accepted answer, outbound links | Native thread/discussion view | Medium precision acceptable in v2 |
| Generic dashboard / SPA app | No | Out of scope | Interact with arbitrary web software | None | None | WebView only | No extraction promise |
| Authenticated enterprise tool | No | Out of scope | Operate inside SaaS products | None | None | WebView only | No extraction promise |
| Arbitrary custom web app | No | Out of scope | Browse any site with app-like behavior | None | None | WebView only | No extraction promise |

## What ships in v1

The v1 supported path is:

- social feed / timeline
- social post / thread detail
- linked article / blog / news page
- profile page
- link preview target

This is the XFeedParadise-critical chain.

## Data contract by v1 format

### Social feed / timeline

Minimum extraction payload:

- source platform
- current URL
- ordered item list
- stable item identity when available
- author identity
- item text
- media summaries
- engagement summaries
- outbound links
- promoted / sponsored flag

### Social post / thread detail

Minimum extraction payload:

- root post identity
- reply and quote relationships
- participants
- timestamps
- engagement
- outbound links

### Linked article / blog / news page

Minimum extraction payload:

- canonical URL
- title and subtitle
- author list
- publish/update dates
- cleaned main body
- structured blocks
- hero image
- tags
- source publication

### Profile page

Minimum extraction payload:

- canonical handle
- display name
- avatar
- bio
- links
- stats
- verification status

### Link preview target

Minimum extraction payload:

- canonical URL
- page title
- site name
- description
- hero image
- coarse type classification

## 90-day NOT list

For the next 90 days, do not scope the product around:

1. universal extraction for arbitrary webpages
2. generic browser automation for all sites
3. full support for dashboards, authenticated tools, and arbitrary SPAs
4. enterprise workflow software as a primary use case
5. broad ecommerce extraction as a top-level wedge
6. search-engine-native browsing as the main entry point
7. "Noos for the whole web" as the product story

## Implementation consequences

This support matrix implies:

1. page classification must optimize for feed, thread, article, profile, and generic preview first
2. article parsing should be a dedicated branch, not the universal extractor
3. feed and thread extraction need site-specific item segmentation
4. unsupported pages should fail gracefully into WebView or raw preview, not pretend to be fully parsed

## Decision

Recommended v1 positioning:

- build the best feed-to-source browser for the XFeedParadise loop
- do not claim to understand every webpage format

This document is Codex research and strategy output.
