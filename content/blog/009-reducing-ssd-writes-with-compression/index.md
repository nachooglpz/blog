---
title: "Reducing SSD Writes With Compression"
subtitle: "Compression becomes a heuristic for database writes."
date: 2026-10-25
lastmod: 2026-10-25
summary: "Compression reduces database write amplification by decreasing the bytes written to storage and the dataset size."
tags:
  - research
  - design
  - heuristics
  - database
  - performance
topics:
  - research
  - SSD
  - storage
  - databases
content:
  format: "essay"
  status: "published"
  original_date: null

editorial:
  proposition:
    - "databases"
  series: null
  issue: null
  featured: true

visual:
  mode: "editorial"
  accent: "signal"
  headline_scale: "medium"
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
  description: "Compression reduces database write amplification by decreasing the bytes written to storage and the dataset size."
  image: ""
  canonical: ""
---

This is the second part of a series about the optimizations that Bohyun Lee, Tobias Ziegler, and Viktor Leis
[propose for database writes to SSDs](https://www.vldb.org/pvldb/vol19/p1469-lee.pdf).

In [my previous entry]({{< ref "blog/008-the-challenges-of-ssd-writes" >}}),
I wrote about the challenges that SSDs represent and why databases are well suited to define write strategies for SSDs.
This entry's topic is about how compression can help to reduce a database's write amplification factor (WAF) by reducing the logical write volume.

The authors of the paper argue that compression reduces DB WAF by decreasing both the amount of bytes written to the storage device, as well as the overall dataset size.
But if the characteristics of the device (which will be shown by the research) are ignored,
compression can backfire; misaligned or variable-length writes may increase read amplification or even fail to reduce write produced and space used at all.

## In-Place Writes Are Not a Good Idea

Consider that a database might use 4 KiB pages, and the SSD does as well (as they typically do).
Compressing the DB pages produce variable-length results (which more often than not, will be smaller than the page's 4 KiB).
If we retain addressing based on PID X 4 KiB, the device will still write full unit sizes (eliminating any physical savings).

Another approach might be to store the compressed pages at variable offsets and maintain a PID->offset mapping.
But because compressed sizes change as the values are updated, offsets will drift, and relocating a page can cascade into shifting neighboring pages.

While some databases ([like MySQL](https://dev.mysql.com/doc/refman/8.4/en/innodb-page-compression.html))
might offload compression to the filesystem, but this problem remains since filesystems might issue I/O in the same page sizes as the DB.

## Easier Compression with Out-Of-Place Writes

The authors of the paper suggest the following approach:

1. Compress the individual pages.

2. Write the resulting compressed pages in batch as a large sequential I/O.

3. Record the new offsets and compressed sizes of the pages.

To make an update and retrieve information, we might need to fetch all the batch pages, modify the needed page, compress again, and then write all of the batch again.
But the scientists argue that in most I/O-bound or out-of-memory scenarios, the I/O savings dominate the CPU cost.

It is important to note that the compression ratio will also determine the write reduction,
and OLTP workloads benefit from compression, as it reduces write volume and storage footprint.

## Page Packing After 4 KiB Compression

The scientists also run benchmarks on random reads using sizes from 512 B to 8 KiB in 512 B steps, aligned to request size.
They found that aligned 4 KiB requests achieved the lowest latency and highest throughput, while smaller or misaligned requests incur in additional internal reads.
Therefore, the authors argue that read is optimal with a 4 KiB granularity and alignment.

## Read Amplification Can Occur Depending on Placement

Since compressed pages are variable-sized, if poorly placed, they can become misaligned on disk.
Misalignment negates the compression benefits by preserving write and space costs while making a single PID read trigger multiple physical reads.

To ensure that each compressed page is retrievable with a single read, page packing is used: each compressed page is aligned to a 4 KiB boundary.
When writing a batch, the authors compress each page and place it into 4 KiB slots via
[best-fit bin packing](https://www.geeksforgeeks.org/dsa/bin-packing-problem-minimize-number-of-used-bins/).
This allows for fast, predictable reads with minimal amplification.
