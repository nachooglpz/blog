---
title: "Reducing Writes With Compression"
date: 2026-10-10
lastmod: 2026-10-17
summary: "Compression reduces DB WAF by lowering both the number of bytes written to storage and the overall dataset size."
tags:
  - field-notes

content:
  format: "note"
  status: "draft"
  original_date: null

editorial:
  proposition:
    - "databases"
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
  description: "Compression reduces DB WAF by lowering both the number of bytes written to storage and the overall dataset size."
  image: ""
  canonical: ""
---

From the paper: [How to Write to SSDs](https://www.vldb.org/pvldb/vol19/p1469-lee.pdf).

## Reducing writes with compression

### Easier compression with out-of-place writes

1. Compress individual pages.

2. Write resulting compressed batch as a large sequential I/O.
    
    To be able to make an update and retrieve information,
    don't we need to fetch all the batch pages, modify the page that we need to,
    compress again, and then write all of the batch again?
    Doesn't that make us write more?

3. Record their new offsets and compressed sizes.

### Compression ratio determines write reduction

Authors tested with LZ4 and ZSTD. Compression ratios for the datasets they tested range from 14% to 49%.

OLTP workloads benefit from compression, as it reduces write volume and storage footprint.

### CPU overheads are negligible in most I/O-bound scenarios

In most I/O-bound or out-of-memory scenarios, the I/O savings dominate the CPU cost.

## Evaluation

Authors claim proposed optimizations reduce total WAF while improving throughput and SSD lifespan.
