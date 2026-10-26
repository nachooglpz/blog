---
title: "How to Write to SSDs"
date: 2026-10-17
lastmod: 2026-10-17
summary: "DBMS control the write pattern to disk, and therefore are best suited to adapt their write behavior to SSDs."
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
  description: "DBMS control the write pattern to disk, and therefore are best suited to adapt their write behavior to SSDs."
  image: ""
  canonical: ""
---

From the paper: [How to Write to SSDs](https://www.vldb.org/pvldb/vol19/p1469-lee.pdf).

## Identifying the source of write amplification

Authors identify 2 main culprits for WA.

### 1. DBMSs themselves write more

DBMS often issues more writes than expected.

When comparing user writes with total amount of writes issued by the DBMS (user + other DB-issued writes),
latter is roughly double the user writes due to the doublewrite buffering overhead.

### 2. SSDs internally amplify DBMS writes

SSD itself amplifies DBMS writes.

WA degrades performance over time and reduces SSD lifespan.

## Out-of-place writes

Flash SSDs differ from disks in two properties:

1. Flash cells only endure limited number of program/erase cycles.

    a. Each write wears the cells.

    b. Device lifetime is tied to volume of physical writes.

2. SSDs exhibit WA because writes are performed at page level (4-16 KiB), while erases reclaim entire blocks (many pages).

    a. When a block containing still-vaid pages must be erased to free space, SSD first relocates those pages.

    b. This increases internal physical writes relative to host writes.

Consider a DBMS issuing a write request to page P.
To free space, SSD's garbage collector selects a block, and if there are pages in that block that are still valid, it copies them elsewhere before erasing that block.

Thus, one logical write of page P results in more physical writes (reducing SSD lifespan and available bandwidth).

### DBMS writes transformed by SSD

Authors are assuming DBMS is writing directly to the block device without any filesystem.
If a filesystem is used, it may alter the write patter the device observes.

On disks, logical and physical addresses mostly coincide;
on SSDs, writes are inherently out-of-place, breaking this fixed mapping.
As a result, the internal placement and WA factor (WAF),
can be severe and difficult to predict (authors reference a prior study where several enterprise SSDs unexpectedly exhibit higher WAF).

### DBMS is best positioned to optimize for SSD writes

Authors argue that SSD WAF mitigation has mostly been attempted at lower layers (SSDs or filesystems),
but these layers lack workload knowledge and merely receive host writes,
which leaves them intrinsically unable to change the write pattern that drives SSD WAF.

DBMS controls the write pattern, though, by choosing what, when, and where to write (so it can proactively influence device behavior).
Therefore, a DBMS can estimate amplification at both levels (SSD and filesystem), and adapt its write patterns accordingly.

### Out-of-place writes are essential for minimizing total WAF

In-place systems fix each page's file location (e.g., using Page Identifier as an offset), and overwrite that location in the page size.
Thus, DBMS cannot alter write placement and inherits device's SSD WAF (reduces opportunities to optimize for SSDs).

Authors describe several benefits to switching to out-of-place writes:

1. Allows DBMS to group and place user writes as it chooses.

2. Eliminates doublewrite buffering (DWB): old page remains valid until new version is durably written.

    a. Allows crash recovery via the previous page and WAL replay.

    b. Removing DWB nearly halves DB-issued bytes while preserving durability.

### Joint consideration of DB and SSD WAF is necessary

To optimize total WAF, DBMS must account for both DB and SSD WAF.
Focusing on only one layer con counterintuitively worsen the other.
For example, LSM-tree engine can lower DB WAF by increasing size tiering, but doing so consumes more SSD space and can raise SSD WAF.

Total WAF, and not individual components, must guide optimization.

## Out-of-place-based optimizations

The following sections are out-of-place-based optimizations that, taken together, minimize total WAF.

- [Reducing writes with compression](/notes/002-reducing-writes-with-compression/)
