---
title: "The Case for Branchless Programming"
subtitle: "In the debate around branchless programming, the best approach is to benchmark."
date: 2026-09-23
lastmod: 2026-09-23
summary: "In the debate around branchless programming, the best approach is to benchmark."
tags:
  - compilers
  - performance
  - software
topics:
  - compilers
  - optimization
  - software-design
  - performance
  - software

content:
  format: "essay"
  status: "published"
  original_date: null

editorial:
  proposition:
    - "cool-code"
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
  description: "In the debate around branchless programming, the best approach is to benchmark."
  image: ""
  canonical: ""
---

The process of execution for the code that we create can go down multiple paths.
The processing unit that runs the instructions that our code generates usually uses a technique called
[pipelining](https://www.geeksforgeeks.org/computer-organization-architecture/computer-organization-and-architecture-pipelining-set-1-execution-stages-and-throughput/),
which grants the CPU the ability to fetch upcoming instructions from memory when executing the current one, allowing it to complete one instruction per clock cycle.

Considering that the CPU has [three basic instruction cycles](https://www.geeksforgeeks.org/computer-organization-architecture/different-instruction-cycles/)
(adding an optional write back cycle), pipelining is based on the notion that the CPU can fetch the next set of instructions even if there is a conditional pending,
as the CPU will decide which is the branch with the highest probability to be executed.

When the CPU predicts the branch of a conditional statement correctly, it gains the advantage that it has already fetched the instructions and can run them when the conditional
evaluates to what the CPU predicted. But if the CPU is wrong, and the branch of a conditional statement evaluates differently from what the CPU predicted,
the CPU needs to fetch the instruction set for the other conditional branch from scratch.
It is here where [cache hits and misses](https://www.geeksforgeeks.org/computer-organization-architecture/cache-hits-in-memory-organization/)
impact the performance for CPU prediction.

## Avoiding conditionals 

Neal Ford, Mark Richards, Pramod Sadalage, and Zhamak Dehghani [once wrote](https://learning.oreilly.com/library/view/software-architecture-the/9781492086888/ch01.html):
> Don’t try to find the best design in software architecture; instead, strive for the least worst combination of trade-offs.

There are cases where we need the CPU to be as efficient as possible and always fetch the next instructions to run,
without having to jump or branch across instructions.
And this is where Branchless Programming advocates come to [make their argument](https://stackoverflow.com/a/11227902/4714970):
> If you guess wrong too often, you spend a lot of time stalling, rolling back, and restarting.

This approach of avoiding conditionals and using [clever techniques](https://stackoverflow.com/q/32107088)
to compute results while avoiding CPU cache misses, relies on the assumption that we know the optimal mechanism for our code to run in the CPU.
But there are other people that argue that we are usually not the best at optimizing our own code and execution.

## Code optimization

For decades, compiler engineers have dedicated their time to optimize the translations that compilers make from source code to assembly and machine code.
Compilers often implement [vectorization](https://every-algorithm.github.io/2025/02/03/automatic_vectorization.html),
[jump threading](https://en.wikipedia.org/wiki/Jump_threading), dead code elimination, and other optimization techniques where branchless conversion also takes part.
This means that even when a programmer codes conditionals, the compiler might identify a branchless optimization and apply it to the program,
allowing the compiler algorithm to decide if the optimization is actually worthwhile (although these are often based on heuristics,
for which the programmer still needs to decide to trust).

Different CPU architectures also implement their own methods to allow for optimizing code,
and even [compilers can optimize](https://martinuke0.github.io/posts/2026-05-15-how-modern-compilers-eliminate-branch-mispredictions-using-predication/)
to take advantage of specific instruction provided by these architectures that allow to execute code without disturbing the branch predictor
as the control flow would remain linear.

The proponents of not implementing branchless programming argue that this programming paradigm is actually a [pessimization](https://stackoverflow.com/a/32706366),
meaning that it is a technique that people apply hoping to improve the performance of a program,
when in practice it might hurt it.

Since the compiler often knows more about the architecture on which a program will run, and probably has better heuristics for code optimization,
unless the programmer is anything close to [Mel](https://users.cs.utah.edu/~elb/folklore/mel.html),
it might be better to let the compiler optimize the program.

In a [discussion thread about branchless programming](https://www.reddit.com/r/cpp_questions/comments/11qzy5g/i_want_to_start_a_discussion_on_branchless/),
a user posted their experience noting that the only times they have seen an improvement in performance by using branchless programming is in math-dominated code running on
Intel architectures.

This might come from the notion that branches can be unpredictable in math-dominated code (compressors might be an example that comes to mind),
and it might be difficult for a compiler to optimize calculations for unpredictable conditions in these types of programs.

## Experimenting with performance

If improving performance of programs is the final goal of branchless programming, Bjarne Stroustrup might have something to say about the discussion.
The first recommendation that he might issue goes in the line of allowing compilers to optimize your code for you, as he has famously said:
> Please remember not to optimize without measurement showing a need to.

But once a need to optimize a program has been identified, it might also be important to determine whether branches are the performance bottleneck, following another quote:
> Measure, if there is anything that you can measure to get feedback.

Another [interesting article](https://undercodetesting.com/branchless-optimizations-when-and-why-it-works-or-doesnt/)
measured and benchmarked the performance of conditional and branchless implementations of common computational operations (swap, abs, min, max, and power of two).
The results showed that most of the operations had the same performance as their branchless implementations when compiled without optimizations.
The author had written:
> Branchless techniques significantly outperform their if-based counterparts when compiled without optimizations.
This happens because the compiler does not yet apply aggressive optimizations, leaving conditional branches as costly jumps.

The only implementation in which the branchless version was still faster than the conditional was the swap operation, and even there,
compiler optimizations made the branchless implementation around 50% faster, suggesting that compiler optimizations still affect branchless code,
and this can have either positive or negative effects on performance. Therein lies the importance of measurement.
