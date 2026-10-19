---
title: "The Challenges of SSD Writes"
subtitle: "Databases are well suited to define write strategies for SSDs."
date: 2026-10-18
lastmod: 2026-10-18
summary: "SSDs work in a different way than disks, and databases need to define a write behavior accordingly."
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
  description: "SSDs work in a different way than disks, and databases need to define a write behavior accordingly."
  image: ""
  canonical: ""
---

I recently stumbled with a [paper](https://www.vldb.org/pvldb/vol19/p1469-lee.pdf) by Bohyun Lee, Tobias Ziegler, and Viktor Leis.
This paper talks about the optimizations that need to be implemented for database systems to leverage both the performance and lifespan of SSDs.

The researchers pose that most DBMSs optimize for SSD characteristics like
[internal parallelism](https://codecapsule.com/2014/02/12/coding-for-ssds-part-4-advanced-functionalities-and-internal-parallelism/#6-internal-parallelism-in-ssds),
[read-write asymmetry](https://www.storagesearch.com/problem-write-iops.html), and [SSD reads](https://www.reddit.com/r/DataHoarder/s/TKSEu2VT1n); but most systems still do not optimize for SSD writes.

This is the start of a series about the optimizations that the scientists propose for a database to write to SSD.

## SSDs are different

Flash SSDs differ from disks in two properties:

1. Flash cells only endure limited number of program/erase cycles; where each write wears the cells, and device lifetime is tied to volume of physical writes.

2. SSD writes from a database are performed at page level (4-16 KiB), while erases reclaim entire blocks (many pages).

SSDs implement technology that make up for what we can consider to be [smart and more durable](https://www.oscoo.com/news/ssd-read-and-write-speed-explained-in-details/) storage.

SSDs have a limitation called "erase-before-write", which means that the basic storage units in NAND flash cannot be directly overwritten at the physical level.
What the controller of an SSD does is to write the updated data to a new (and empty) page, and then marks the original page as invalid.

This limitation also makes garbage collection of invalid pages necessary, so an automatic cleaning process initiated by the controller is implemented during idle time,
moving still-valid pages from one storage block to a new empty block.

This garbage collection process also brings another side effect: [Write Amplification](https://thessdguy.com/what-is-write-amplification/).
When the SSD needs to update a small amount of data, the controller needs to move valid data from entire blocks.
And this makes the amount of data being physically written to be greater than what the database or the operating system might have requested.

## Write amplification in DBMSs

The researchers mention two causes for write amplification (WA) in database systems.

The first culprit is that DBMSs often issue more writes than expected.
When comparing user writes with the total amount of wirtes issued by the DBMS (user + other DB-issued writes),
the latter is roughly double the user writes due to doublewrite buffering (DWB) overhead.

The second culprit is that SSDs themselves amplify DBMS writes, as mentioned from the "erase-before-write" and garbage collection mechanisms.

The problem is that this WA degrades performance over time and reduces the lifespan of SSDs.

## Out-of-place writes

The authors present the example of a DBMS issuing a write request to page P.
To free space, the SSD's garbage collector selects a block and, if there are pages in that block that are still valid, it copies them elsewhere before erasing that block.
Therefore, one logical write of page P results in more physical writes (reducing SSD lifespan and available bandwidth).

In-place systems fix each page's file location (e.g. by using a Page Identifier as an offset), and overwrite that location in the page size.
Thus, a DBMS cannot alter write placement and inherits the device's SSD WAF, and reduces opportunities to optimize for SSDs.

The scientists describe several benefits to switching to out-of-place writes:

1. They allow a DBMS to group and place user writes as it chooses to.

2. They eliminate doublewrite DWB since the old page remains valid until the new version is durably written.

This allows crash recovery via the previous page and WAL replay.
Also, removing DWB nearly halves DB-issued bytes while preserving durability.

## DBMSs are best positioned to optimize for SSD writes.

For this case, the authors assume that the DBMS writes directly to the block device without any filesystem; consider that if a filesystem is used, it may alter the write pattern the device observes.

On disks, logical and physical addresses mostly coincide; on SSDs, writes are inherently out-of-place, breaking this fixed mapping.
As a result, the internal placement and WA factor (WAF), can be harsh and difficult to predict.

The proponents also argue that SSD WAF mitigation has mostly been attempted at lower layers (SSDs or filesystems),
but these layers lack workload knowledge and merely receive host writes.
This leaves them intrinsically unable to change the write pattern that drives SSD WAF.

DBMSs control the write pattern, though, by choosing what, when, and where to write; so they can proactively influence device behavior.
Therefore, a DBMS can estimate amplification at both levels (SSD and filesystem), and adapt its write patterns accordingly.

### A need for joint consideration

The researchers argue that to optimize total for a WAF, DBMSs must account for both DB and SSD WAFs.
Focusing on only one layer can (counterintuitively) worsen the other.
For example, an LSM-tree engine can lower DB WAF by increasing size tiering, but doing so consumes more SSD space and can raise the SSD WAF.
