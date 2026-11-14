---
title: "Deathtime-Based Garbage Collection"
date: 2026-11-09
lastmod: 2026-11-09
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

## Database Write Amplification and Garbage Collection

During Garbage collection, an SSD selects a block (of the SSD) to erase.
When the SSD reclaims the space for that block, write amplification (WA) occurs in the sense that each valid section of that block needs to be rewritten elsewhere.
The authors calculate the WA factor for this as the following:

$$
\frac{1}{1 - \text{\% of valid pages in the block}}
$$

### Skewed Workloads

A common GC policy is to choose the block with least valid pages, which is optimal for uniform random workloads.
But for real-life workloads, which are usually skewed, this policy becomes suboptimal; skew puts hot and cold pages within blocks, rasing valid page-ratios (and WA).

### DBMS Know Better

A DBMS can classify data by:

    1. Hotness.

    2. Expected lifetime.

    3. Based on spatial or temporal locality.

A database can group pages according to these characteristics and reduce bigger ratios in blocks being garbage-collected.
The advantage of a database (over SSDs firmware or file systems), lies in the information they pose within richer workloads and data semantics.

## Grouping by Deathtime

Using database semantics to estimate each page's deathtime alows to group pages that die together in the same zome, reducing WA during reclamation.

### Timestamps for deathtime estimation

To apply grouping by deathtime (GDT), the system must estimate the page's deathtime before writing it to SSD.
The authors extend the page header with a write timestamp, updated whenever the page is persisted,
and maintain a write history (WH) of the last *n* timestamps (GC writes do not update WH).

The next write time is estimated extrapolating recent write intervals to predict when the page will be overwritten:

$$
EDT = \text{current\_lsn} + \frac{WH_n - WH_1}{n - 1}
$$

For initial writes, pages are grouped by B-tree index ID, as to group pages with similar access patterns.

### GDT-Based Placement Strategy

When a batch of pages is written upon eviction, GDT computes each page's EDT; pages are grouped and page-packed so that each group contains pages with similar deathtimes.

For each group, the zome whose existing pages have the closest average EDT is selected.
If there is no active zone, a new one is opened.
This alows to concentrate pages with similar deathtimes into the same zone.

### GDT-Based GC

GDT placement is only effective when paired with GDT-aware GC; else, GC writes and normal writes may intermix.

GC select victim zones until their cumulative invalid pages free te space of one zone.
And all valid pages in these victimes are loaded, sorted in descending EDT, grouped and packed, and written to an open zone witha matching EDT when possible.
Otherwise, they remain in their original zone.

Pages that are never rewritten (like read-only pages) are assigned the maximum EDT to be treated as the coldest data.
This replacement during GC also compensates for initial EDT mispredictions.

### REassigning EDT ranges after GC

Since after each GC cycle, zones may be full, partially full, or empty; empty and partially full zones are made available for normal writes.

The newly emptied zone is assigned the minimum EDT range; they draw short-lived pages.
Partially full zones attract warm pages, and full zones retain the coldest pages.

This preserves aligned invalidation times within each zone (even after going through GC cycles).
