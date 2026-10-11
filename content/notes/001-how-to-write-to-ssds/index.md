---
title: "How to Write to SSDs"
date:
lastmod:
summary: ""
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
  description: ""
  image: ""
  canonical: ""
---

From the paper: [How to Write to SSDs](https://www.vldb.org/pvldb/vol19/p1469-lee.pdf).

## Identifying the source of write amplification

Authors identify 2 main culprits for WA.

### 1. DBMSs themselves write more

DBMS often issues more writes than expected.

When comparing user writes with total amount of writes issued by the DBMS
(user + other DB-issued writes), latter is roughly double the user writes
due to the doublewrite buffering overhead.

### 2. SSDs internally amplify DBMS writes

SSD itself amplifies DBMS writes.

WA degrades performance over time and reduces SSD lifespan.

## Reducing Writes With Compression

### Easier compression with out-of-place writes

1. Compress individual pages.

2. Write resulting compressed batch as a large sequential I/O.
    
    \[To be able to make an update and retrieve information,
    don't we need to fetch all the batch pages, modify the page that we need to,
    compress again, and then write all of the batch again?
    Doesn't that make us write more?\]

3. Record their new offsets and compressed sizes.

### Compression ratio determines write reduction

Authors tested with LZ4 and ZSTD.
Compression ratios for the datasets they tested range from 14% to 49%.

OLTP workloads benefit from compression, as it reduces write volume and storage footprint.

### CPU overheads are negligible in most I/O-bound scenarios

In most I/O-bound or out-of-memory scenarios, the I/O savings dominate the CPU cost.

## Evaluation

Authors claim proposed optimizations reduce total WAF while improving throughput and SSD lifespan.
