---
title: "Reducing Writes With Compression"
date: 2026-10-10
lastmod: 2026-10-25
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

Compressing pages before flushing them to device lowers the logical write volume.
Therefore, compression reduces DB WAF by decreasing:

1. Bytes written to storage.

2. Overall dataset size.

But if the characteristics of the device are ignored,
compression can backfire as misaligned/variable-length writes may increase read amplification or fail to reduce write and space at all.

## Difficulties of in-place writes

Considering that pages are the same size as the units that SSD write (4 KiB), compressing the pages produce variable-length results (smaller than the page size).
If we retain PID X 4 KiB addressing, device still writes full unit size (eliminating physical savings).

One could instead store compressed pages at variable offsets and maintain PID->offset mapping,
but compressed sizes change as values are updated, while offsets drift, and relocating a page can cascade into shifting neighboring pages.

While some databases (like MySQL) might offload compression to the filesystem, but the problem remains as filesystems might issue I/O in page sizes (or larger units).

## Easier compression with out-of-place writes

1. Compress individual pages.

2. Write resulting compressed batch as a large sequential I/O.
    
    To be able to make an update and retrieve information,
    don't we need to fetch all the batch pages, modify the page that we need to,
    compress again, and then write all the batch again?
    Doesn't that make us write more?

3. Record their new offsets and compressed sizes.

### Compression ratio determines write reduction

Authors tested with LZ4 and ZSTD. Compression ratios for the datasets they tested range from 14% to 49%.

OLTP workloads benefit from compression, as it reduces write volume and storage footprint.

### CPU overheads are negligible in most I/O-bound scenarios

In most I/O-bound or out-of-memory scenarios, the I/O savings dominate the CPU cost.

## Page packing after 4 KiB compression

### Read is optimal with 4 KiB granularity and alignment

Authors run benchmarks on random reads using sizes from 512 B to 8 KiB in 512 B steps, aligned to request size.

Aligned 4 KiB requests achieved lowest latency and highest throughput,
while smaller or misaligned requests incur in additional internal reads.

## Read amplification can occur depending on the placement

Compressed pages are variable-sized; if poorly placed, can become misaligned on disk.
Misalignment negates compression benefits by preserving write and space costs while making a single PID read to trigger multiple physical reads.

To ensure each compressed page is retrievable with a single read, *page packing* is used: each compressed page is aligned to a 4 KiB boundary.
When writing a batch (e.g., 64 pages), authors compress each page and place it into 4 KiB slots via best-fit binpacking algorithm.

Page packing allows for fast, predictable reads with minimal amplification.

## Evaluation

Authors claim proposed optimizations reduce total WAF while improving throughput and SSD lifespan.
