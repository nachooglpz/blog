---
title: "Heuristics Are the Secret Sauce"
subtitle: "How do we develop the heuristics that make up better software?"
date: 2026-10-07
lastmod: 2026-10-07
summary: "In computer science, each machine and software is an experiment."
tags:
  - heuristics
  - research
  - design
topics:
  - computer-science
  - research
  - heuristics
demo: true

content:
  format: "essay"
  status: "published"
  original_date: null

editorial:
  proposition:
    - "cool-design"
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
  description: "How do we develop the heuristics that make up better software?"
  image: ""
  canonical: ""
---

In my previous entry I wrote about how databases that implement a cost-based optimizer use
[heuristic pruning](https://www.geeksforgeeks.org/artificial-intelligence/heuristic-search-techniques-in-ai/)
to avoid an exhaustive search of the plan space (which in a query optimizer represents the set of possible ways to implement a query).

Some of the common heuristics that are implemented in [databases](https://cs186berkeley.net/sp20/static/notes/n9-Query_Opt.pdf) can be:

1. Selection cascade and pushdown
    Applying selections as soon as you have the relevant columns, as this will lower the size of inputs to the joins.
    Another heuristic that developed this one is the assumption that selection is cheap and/or free, while joins are expensive.

2. Projection cascade and pushdown
    Keeping only the columns that are needed to evaluate downstream operators.
    While we might need all the columns to do joins, it is better to get rid of them as soon as we don't need them.
    And this way, [sort-merge](https://www.geeksforgeeks.org/dbms/merge-join-in-dbms/)
    or [hashing](https://en.wikipedia.org/wiki/Hash_join) take less space.

3. Avoiding Cartesian products
    Given the a choice, do [theta-joins](https://stackoverflow.com/questions/7870155/difference-between-a-theta-join-equijoin-and-natural-join)
    rather than [cross-product](https://www.geeksforgeeks.org/sql/sql-cross-join/).
    And although this approach might not always be a good solution, it allows the optimizer to keep the plan space small.

But these examples are the heuristics that the query planner of a database might use to discard options in the plan space.
Heuristics can be found all over computer science disciplines to describe techniques, fundamentals, and theories on how to design and code programs.

## Empirical Inquiry

The [etymology](https://www.etymonline.com/word/heuristic) of the word *heuristic* means *"serving to discover or find out"*, and computer science,
as [Allen Newell and Herbert Simon might argue](https://dl.acm.org/doi/abs/10.1145/360018.360022), is just another empirical discipline.
The scientists, in their 1975 Turing Lecture, presented a thesis for computer science as the discipline to study the machine from an empirical perspective.
Their argument lies in that, unlike other sciences, some of the forms of observation and experience do not fit the stereotype of the experimental methods.

In computer science each new machine that is built, as well as each new program developed for that proposed machine is an experiment.
We observe the machine in operation and analyze its behavior by analytical and measurement means.
The most interesting part is that both hardware and software are artifacts that have been designed,
and therefore they are not black boxes since we can relate their structure to their behavior and draw lessons from experimenting.

### Qualitative Structure

Newell and Simon also argued that all sciences start by characterizing qualitatively the systems they study.
Biology uses cells; geology, plate tectonics; medicine, germs as a theory for disease; and atoms offer a structure to describe the nature of physics.
Laws of qualitative structure are not only everywhere in science, but even some of the greatest scientific discoveries are to be found among them.

## Search Engine Wars

The need of actively developing and deriving qualitative structures for the development of programs and systems can still be observed outside of theory.
One of the most important systems used since the boom of the internet are information retrieval (IR) systems as the core of search engines.
Google started from the development of [PageRank](https://ethw.org/Milestones:PageRank_and_the_Birth_of_Google,_1996-1998),
a system that interpreted the importance of a page by how many other pages linked to it.
User preference through the passage of time proved Google's algorithms more effective than the ones implemented by their competition,
and even the fall of Yahoo is attributed to their turning down of Google's offer to be bought several times.

The [performance of retrieval systems](https://dl.acm.org/doi/10.1145/1008992.1009004) is closely related to the use of heuristics.
Research in the IR discipline often focuses on developing heuristics on which algorithms and strategies allow to find results closer to what people need or expect,
and since the development of these heuristics are what drive competition, companies (more often than not) keep these research extremely protected,
as it is the basis of any IR product.
To this day Google noticeably still [works on IR research](https://research.google/research-areas/information-retrieval/)
to keep on improving their search engine.

It is through the study of design and implementation of systems for machines,
as well as developing the heuristics that pave the algorithms that Google (and other IR products) implement,
that these companies and products maintain user preference.
