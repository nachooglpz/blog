---
title: "How Databases Did AI Before It Was Cool"
subtitle: "Vibe coding and agentic engineering have boomed recently, but databases have done AI for decades."
date: 2026-10-01
lastmod: 2026-10-01
summary: "Databases are an example of program synthesis, while a query optimizer might use heuristic search."
tags:
  - database
  - programming
  - AI
  - heuristics
topics:
  - databases
  - search-problems
  - AI
demo: true

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
  description: "Databases are an example of program synthesis, while a query optimizer might use heuristic search."
  image: ""
  canonical: ""
---

In 1972, Edgar Frank "Ted" Codd published a paper called
["Relational Completeness of Data Base Sublanguages"](https://docslib.org/doc/2384210/relational-completeness-of-data-base-sublanguages),
which established an equivalence in expressive power between [relational calculus](https://www.geeksforgeeks.org/dbms/tuple-relational-calculus-trc-in-dbms/)
and [relational algebra](https://www.geeksforgeeks.org/dbms/introduction-of-relational-algebra-in-dbms/).
The theorem that he developed implied that there was a connection between the declarative representation of queries and their operational description,
which opened the door to SQL as we know it.

The declarative nature of SQL, allowing a user to state what information they want to retrieve and not how to get it,
enables a system to optimize how to retrieve and process the information the user is requesting.

## Program synthesis

In computer science, there is a field called [program synthesis](https://en.wikipedia.org/wiki/Program_synthesis),
which studies how to automatically generate a program given a formal specification; in other words, this field allows a user to create a program without actually coding it.
This idea might remind us of the concepts of [vibe coding](https://en.wikipedia.org/wiki/Vibe_coding) or
[agentic engineering](https://www.ibm.com/think/topics/agentic-engineering),
where the user might specify a program's goal (or even structure) in natural language,
although these might not exactly count as program synthesis since English is not a formal language.
Nonetheless, as a formal language, SQL might be an example of how databases have been implementing program synthesis for a few decades.

## The query optimizer

During the '70s and '80s, commercial databases that adopted SQL (or an SQL-like API) had to implement a
[query optimizer](https://www.geeksforgeeks.org/dbms/query-optimization-in-relational-algebra/) for the system to plan how to effectively (and efficiently)
retrieve the data that the user asked for.

The first approach was to use [rule-based optimization](https://www.relationaldbdesign.com/sql-tuning/module2/sql-optimizer-modes.php),
allowing the system to design a query execution plan based on a set of rules, such as whether the data to be retrieved had an index,
but not accounting for any current state of the database or the data layout.
A few years after Ted Codd published his papers justifying his theorem and the proposal for the relational data model,
the research division at IBM started developing System R as a relational database.
One of the innovations of System R was the implementation of a [cost-based optimizer](https://www.geeksforgeeks.org/software-engineering/cost-based-optimization/),
developed by [Patricia Selinger et al.](https://courses.cs.duke.edu/compsci516/cps216/spring03/papers/selinger-etal-1979.pdf#G429298).

System R's cost-based optimizer has come to be considered a framework known as the bible of query optimization.
This framework uses catalog stats to find the least-cost plan per query block.
The idea is that since each block of a query can be converted to relational algebra, and each operator has different implementation options,
operators can be applied in different orders.

There are three main components of a cost-based query optimizer:

1. The **plan space**, which analyzes the possible ways to implement a query.
2. The **cost estimation**, which analyzes the cost of a particular plan.
3. The **search strategy**, which aims to answer the question: *given that we have a plan space, how do we efficiently find a plan with the cheapest cost estimate?*

## Search problems

While there are many foundations of AI, [search algorithms](https://www.geeksforgeeks.org/machine-learning/search-algorithms-in-ai/)
allow systems to find solutions by exploring paths and traversing states in a problem space.
Databases that implement a cost-based optimizer implement these search algorithms as part of their search strategy, exploring the different plans of the plan space
while trying to find the cheapest path to run a query.
And because the plan space might grow exponentially depending on the complexity of a query, 
modern databases and optimizers also implement the use of [heuristic pruning](https://www.geeksforgeeks.org/artificial-intelligence/heuristic-search-techniques-in-ai/)
to avoid an exhaustive search of the plan space.

Query optimizers are the magic that allows for databases to translate a formal language such as SQL into a complete data description and manipulation program.
The long-standing objective of databases has been to retrieve data and apply operators on said data efficiently,
and this objective has driven innovations that incorporate research from other areas of computre science, serving as an example of collaboration across fields.
