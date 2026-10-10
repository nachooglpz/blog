---
title: "Linus's Proposal for O_DIRECT Redesign"
subtitle: ""
date: 2026-08-25
lastmod: 2026-10-08
summary: "Mail discussion about Linus Torvald's redesign proposal for O_DIRECT."
tags:
  - Open Source
  - Linux

external_url: "https://yarchive.net/comp/linux/o_direct.html"

content:
  format: "Mail"
  status: "Catalogued"
  original_date: 2002-05-10
  collection: "Norman Yarvin's Collection"

editorial:
  proposition:
    - "cool-design"
  series: null
  issue: null
  featured: false

visual:
  mode: "archive"
  accent: "quiet"
  headline_scale: "medium"
  opening_alignment: "left"
  hero: ""
  hero_alt: ""
  hero_treatment: "monochrome"
  invert_opening: false

archive:
  start_year: 2002
  end_year: 2007
  locations:
    - Internet
  people:
    - "Linus Torvalds"
  source: "Usenet Archives"
  rights: "N/A"

seo:
  description: ""
  image: ""
  canonical: ""
---

During 2002, Linus Torvalds had proposed [another implementation for `O_DIRECT`](https://yarchive.net/comp/linux/o_direct.html).
During that time, `O_DIRECT` was not as performant, and it showed up to a 55% performance hit vs no `O_DIRECT`.
Linus attributed this problem to the fact that `O_DIRECT` needed to be asynchronous and had to do read-ahead.

What Linus had proposed when doing an `O_DIRECT` read into a buffer is to divide this process in two phases:

1. Allocate the pages, and start the I/O operation asynchronously.
2. mmap the file with a `MAP_UNCACHED` flag, causing read-faults to "steal" the page from the page cache and making it private to the mapping on the page faults.

And any `write()` operation would be the other way around:

1. Take the pages in the memory area and move them to the page cache, removing the page from the page table (and only copying it if pages already exist).
2. Make the I/O operation to disk.

With this approach, the kernel would not have to make a copy of the buffer that the process is trying to flush to disk into its own cache (to immediately send to disk),
but would just take ownership of this allocated buffer from the process, and be able to do any operations it needs with it (including flushing it to disk).

While a clever implementation that would make `O_DIRECT` operations more performant, the only change that was made to the design was the asynchronous processing of `O_DIRECT`.
Because most of the database systems (and other complicated programs) were already using the POSIX-inspired API, the only update that was made to the design of this API
was the underlying processing for these calls.
