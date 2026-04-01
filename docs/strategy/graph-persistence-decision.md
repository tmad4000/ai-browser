# Persistent Web Graph Decision

Author: Codex
Date: 2026-03-31
Status: Proposed architecture decision

## Question

Should the long-lived graph of scraped web content share infrastructure with the product-facing app backend, and should this project merge conceptually with a Noos-like persistent graph of the web?

## Short answer

Do not merge them conceptually yet.

Treat the persistent web graph as infrastructure that serves the product, not as the product wedge itself.

Recommended near-term boundary:

- same cluster if convenient
- separate logical database for the persistent web graph
- separate ingestion pipeline
- separate schemas / bounded contexts

Do not use one shared graph schema as the source of truth for everything.

## Why

### 1. The wedge is narrower than the platform vision

The immediate wedge is XFeedParadise-like browsing:

- discover in feed
- inspect thread
- open source
- persist useful entities and relations

"Alternative graph version of the web" is a substrate vision, not the beachhead product.

If you lead with the substrate, the project becomes another platform abstraction without a market wedge.

### 2. The data has different failure modes

The persistent web graph will be:

- noisier
- more weakly normalized
- higher volume
- more schema-volatile
- more ingestion-heavy

The product-facing backend will care about:

- user state
- saved items
- explicit curation
- application permissions
- low-latency product queries

Those are not the same workload.

### 3. Shared schema creates blast radius too early

If raw-ish web captures and product-facing entities live in one shared graph model:

- schema changes become risky
- bad extraction pollutes product queries
- deletion and retention policies become tangled
- multi-tenant privacy rules get harder
- experimentation on ingestion becomes dangerous

## Option comparison

### Option A: same Neo4j database, same broad schema

Pros:

- lowest setup overhead
- one place to query everything

Cons:

- highest blast radius
- noisy captures contaminate product state
- difficult retention and migration story
- hard to evolve schemas independently

Recommendation:

- reject for now

### Option B: same cluster, separate logical database or strict bounded schema

Pros:

- still operationally simple
- allows shared infra and credentials
- isolates ingestion churn from product state
- easier migration path later

Cons:

- some operational coupling remains
- requires discipline around boundaries

Recommendation:

- recommended near-term default

### Option C: separate service and storage stack

Pros:

- strongest isolation
- easiest to scale independently
- cleanest mental model

Cons:

- more operational overhead now
- more integration work before product learning

Recommendation:

- probably the end-state if the graph substrate becomes large
- not necessary on day one

## Recommended storage split

### Raw captures

Canonical source of truth:

- object storage or append-only document store

Examples of raw capture artifacts:

- raw HTML
- rendered DOM snapshot
- extracted metadata blob
- screenshot or rendered preview
- ingestion provenance

Do not use Neo4j as the canonical store for raw page captures.

### Normalized web graph

Canonical source of truth:

- dedicated graph database for normalized entities and edges

Examples:

- page
- author / account
- publication
- post
- article
- product
- topic
- link / mention / citation / quote relationships

This is the Noos-like layer.

### Product-facing application state

Canonical source of truth:

- app backend store, separate from the normalized web graph boundary

Examples:

- users
- sessions
- preferences
- saved collections
- ranking state
- moderation state
- prompt configuration
- UI-specific caches

If some product-facing state is graph-native, it can still live in a separate product graph database. The point is bounded context, not forcing a relational model.

## Proposed architecture

1. Capture page in browser session
2. Store raw capture artifact outside the graph
3. Run extraction / normalization pipeline
4. Write normalized entities and edges to the persistent web graph
5. Materialize product-specific views or references into the app backend

The product reads from:

- product backend for user state
- persistent web graph for reusable world knowledge
- raw capture store only for debugging or reprocessing

## What this means for project structure

Do not merge the projects as one undifferentiated codebase mandate.

Instead:

- keep one product surface if that helps velocity
- define a separate ingestion subsystem
- define separate schemas and ownership
- allow the persistent graph to become a platform later only if usage justifies it

## Migration path

### Phase 1

- same cluster if convenient
- separate logical database
- raw artifacts in object storage
- normalized graph in Neo4j

### Phase 2

- add reprocessing jobs
- add graph quality scoring
- add product-specific materializations

### Phase 3

- split into separate service if ingestion scale, privacy, or query load demands it

## Decision

Recommended near-term choice:

- do not merge the product story around a universal web graph
- build the persistent graph as infrastructure
- use separate logical storage boundaries now
- keep migration to a separate service open later

This document is Codex research and strategy output.
