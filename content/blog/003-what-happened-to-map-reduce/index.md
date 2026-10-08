---
title: "What Happened to MapReduce"
subtitle: "MapReduce made waves when it was first published, but what happened to it?"
date: 2026-09-16
lastmod: 2026-09-16
summary: "David J. DeWitt and Michael Stonebraker argued that MapReduce was a step backwards for the database community."
tags:
  - cloud
  - database
topics:
  - database
  - dataflow-engines
  - Google
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
  description: "David J. DeWitt and Michael Stonebraker argued that MapReduce was a step backwards for the database community."
  image: ""
  canonical: ""
---

With the boom of the Internet in the early 2000s, the amount of data Google had to process exploded.
They had designed a [distributed file system](https://www.geeksforgeeks.org/devops/google-file-system/)
in which large files are partitioned, distributed, and replicated across nodes for fault tolerance.

To be able to process all of this data, they also developed [MapReduce](https://cs186berkeley.net/notes/note18/), a high-level programming model for parallel data processing which,
as its name implies, is composed of two phases: Map and Reduce.
As a leader in large-scale data processing, Google's file system design and processing paradigm quickly became attractive; and an open-source version of it,
known as [Hadoop](https://hadoop.apache.org/docs/current/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html), quickly became popular.

## A restrictive paradigm

In 2008, David J. DeWitt and Michael Stonebraker [wrote about their reactions](https://homes.cs.washington.edu/~billhowe/mapreduce_a_major_step_backwards.html)
to the MapReduce paradigm, arguing that, although the paradigm may have been a good idea for writing certain types of general-purpose computations,
it was a step backwards for the database community.

The following are the concerns that they noted.

### Database access and schema

The scientists argued that schemas are a crucial part of an application program,
as they allow systems to keep "garbage" out of a dataset by providing a way for the runtime to ensure that input records obey said schema.

Joe Hellerstein [has argued](https://youtu.be/FsxVsBZ7V30?si=chJ9wosQ8jTl2RkL&t=244) that we need to separate the layers of a system
and provide independence between those layers, creating what he called "Hellerstein's Inequality":
> Data independence is most important when the rate of change of your environment exceeds the rate of change of your applications.

DeWitt and Stonebraker argue that MapReduce forces the access program to specify an algorithm for data access,
instead of stating what information is needed, violating the principle of separating the schema from the application program.
They compare this approach to the debate between relational vs. CODASYL, where relational promoted access through a declaration of the desired data, and CODASYL promoted access through
the specification of the algorithm to retrieve said desired data.

There might be an argument that claims that the datasets that MapReduce targets have no schema;
but the scientists refute this by arguing that when extracting a key from the input data set,
the map function relies on the existence of at least one data field in each input record.

### Brute force implementation

As a second concern, the scientists argued that MapReduce only provides a brute-force processing approach,
relying only on providing parallel execution on a grid of shared-nothing computing nodes.
What the scientists argue is that this feature has already been implemented in different prototypes for modern database management systems;
and that DBMSs also implement hash or B-tree indexes to accelerate access to data
which, combined with a query optimizer that decides when to use said index and when to perform a brute-force sequential search, provide a better processing approach.

### Skew factor

Another disadvantage of MapReduce is the skew factor.
DeWitt and Jim Gray [had written](https://people.csail.mit.edu/tdanford/6830papers/dewitt-gray-parallel-databases.pdf) about how skew is an impediment to achieving successful
scale-up in parallel query systems.
When the distribution of records per key occurs in the map phase, some reduce instances receive more records than others, and the total time of computation
depends on the running time of the slowest instance (or the one that receives the most records).

Also, when using a [pull design](https://www.geeksforgeeks.org/system-design/pull-vs-push-api-architecture-system-design/),
it is inevitable that two reduce nodes will try to access the same map node, reducing the disk transfer rate of that map node.

### An old paradigm

Besides programmers looking at Google and thinking that if Google was using MapReduce, everybody should be using it,
the MapReduce community seemed to feel that they had discovered a new paradigm.
But the idea of partitioning a large data set into smaller partitions was [first proposed in 1983](https://dl.acm.org/doi/10.1007/BF03037022),
with many other implementation proposals following.

They also noted that if the ability to write MapReduce functions was what differentiated the paradigm from a parallel SQL implementation,
PostgreSQL supported [user-defined functions](https://www.postgresql.org/docs/current/xfunc.html)
and [user-defined aggregates](https://www.postgresql.org/docs/current/xaggr.html) since the mid-1980s. Modern database systems have provided such functionality since 1995.

### Missing features and incompatibility

DeWitt and Stonebraker mentioned how a modern SQL database has diverse classes of tools available that MapReduce cannot use and for which it has no equivalents of its own.
Some of these useful tools are the following.

1. **Report writers** to prepare reports for human visualization.
2. **Business intelligence tools** to enable querying of data warehouses.
3. **Data mining tools** to allow users to discover structure in large data sets.
4. **Replication tools** to allow users to replicate data from one DBMS to another.
5. **Design tools** to assist the user in building the database.

Considering the [database access](#database-access-and-schema) concern,
integrity constraints and referential integrity are features to help keep garbage out of the database that were still missing from MapReduce.
Views were also missing, so that the schema can be updated.

The scientists also noted other features provided by modern DBMSs that are missing in MapReduce.
These include a **bulk loader** to transform input data into a desired format; but one could argue that the objective of the MapReduce paradigm is to be a bulk loader.
They also noted the necessity to have indexing (as mentioned previously), updates, and transactions; but one could also argue that if MapReduce is more about
the parallel processing of data, these should be implemented elsewhere in the system.

Even if MapReduce were to be only the parallel processing paradigm of a bigger system, being SQL-incompatible was a big limitation on the use of the mentioned tools.

## Dataflow engines

The MapReduce paradigm is actually a specific instance of a group of execution systems known as
[dataflow engines](https://ebrary.net/64927/computer_science/dataflow_engines#google_vignette).
The base logic for these systems lies in modeling the flow of data through several processing stages:
input is partitioned and processed in parallel, then sent to a set of nodes; the output generated by these nodes is then sent through the network to another set of nodes.
The map and reduce functions that the MapReduce paradigm uses are also known as *operators*, where the output of one operator becomes the input of another,
and the nodes of a system are characterized by the operators they implement.

An example of another dataflow engine is [Spark](https://spark.apache.org/)
(which also won the [2022 SIGMOD Systems Award](https://sigmod.org/2022-sigmod-systems-award/)).
This system uses a semi-structured data model, so objects can be anything from key-value pairs to objects of a certain type.
These objects are organized into [Resilient Distributed Datasets (RDDs)](https://spark.apache.org/docs/latest/rdd-programming-guide.html),
which are distributed, immutable data sets, together with their lineage (an expression describing how the data was computed).

What is most interesting about this system is that it is based on [relational operators](https://spark.apache.org/docs/latest/sql-ref-operators.html)
instead of explicit map and reduce functions defined by the user, and therefore it implements its own SQL-like API for users to operate on data.

## Coming back to SQL

There are two famous papers on database systems that [talk about the history of data models](https://people.cs.umass.edu/~yanlei/courses/CS691LL-f06/papers/SH05.pdf);
although the one that concerns this entry is the [continuation paper](https://courses.cs.washington.edu/courses/csep544/25wi/papers/goes-around-and-around.pdf),
which also discusses MapReduce and dataflow engines overall.
The main thesis of these two papers is that data models (and therefore database systems) [have followed a cycle](https://youtu.be/8Woy5I511L8?si=6ms6N0fzCDYn0VQX&t=134)
of trying to replace the relational data model and SQL, only to return, with SQL incorporating ideas from the data models that tried to replace it
(we could see this behavior in Spark).

Pavlo and Stonebraker had written that at the time of the development of MapReduce, Google had little expertise in DBMS technology,
and that they had built their system to meet their needs.
Google has now moved from the original Google File System and MapReduce to new implementations like
[Colossus](https://cloud.google.com/blog/products/storage-data-transfer/a-peek-behind-colossus-googles-file-system) and
[Dataflow](https://docs.cloud.google.com/dataflow/docs/overview), as well as implementing their own [relational database](https://docs.cloud.google.com/spanner/docs).

In their critique of MapReduce, DeWitt and Stonebraker mentioned that MapReduce implementers would do well to study a bit of the history of parallel DBMS research,
and it appears that Google did its homework.
Moreover, the researchers mentioned that overall computer science communities tend to be insular and do not read the literature of other communities,
and this urge to learn from other areas of computer science might be the biggest lesson to learn from MapReduce.
