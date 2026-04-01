# Classification Fixtures

Author: Codex
Date: 2026-03-31
Status: Manual verification examples

These are fixture-style examples for the immediate classification fix.

## Expected search pages

- `https://www.google.com/search?q=defuddle` -> `search`
- `https://duckduckgo.com/?q=noos+project` -> `search`
- `https://www.bing.com/search?q=xfeedparadise` -> `search`

## Expected non-search pages

- `https://example.com/article?q=test` -> not `search`
- `https://news.ycombinator.com/item?id=12345` -> not `search`
- `https://x.com/someuser/status/12345?q=test` -> not `search`

## Expected unknown-page behavior

When a page does not classify as a supported structured surface and no site-specific prompt matches:

- do not force it into the article schema
- render a raw preview instead
- keep the user in a graceful fallback state rather than claiming full extraction
