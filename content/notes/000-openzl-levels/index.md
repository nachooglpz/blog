---
title: "OpenZL Levels"
date: 2026-11-02
lastmod: 2026-11-02
summary: "OpenZL levels as parameters to tune."
tags:
  - field-notes

content:
  format: "note"
  status: "draft"
  original_date: null

editorial:
  proposition:
    - "compression"
  series: null
  issue: null
  featured: false

visual:
  accent: "quiet"
  headline_scale: "small"
  opening_alignment: "left"
  hero: ""
  hero_alt: ""
  hero_treatment: "raw"
  invert_opening: false

archive:
  start_year: null
  end_year: null
  locations: []
  people: []

seo:
  description: "OpenZL levels as parameters to tune."
  image: ""
  canonical: ""
---

## Compression Level

Computational effort that OpenZL spends compressing data by influencing graph and codec decisions.

- **Lower compression:** + speed, - compression.
- **Higer compression:** - speed, + compression.

A higher compression level may allow OpenZL to use more expensive match-finding techniques or different compression configurations.

**Default level:** 6

For the numeric data type, the [Compression Transformer](/notes/000-compression-transformer/) can be set by establishing the compression level to 7.

## Decompression Level

Impacts which compression techniques OpenZL selects based on their expected decompression performance.
Influences the tradeoff between compression ratio and decompression speed.

If there are two possible encoding strategies:

| Strategy | Compressed size | Decompression Speed |
|----------|-----------------|---------------------|
| A        | 300 KB          | 2 GB/s              |
| B        | 330 KB          | 4 GB/s              |

OpenZL's preferences between strategies can be influenced.

**Default level:** 3
