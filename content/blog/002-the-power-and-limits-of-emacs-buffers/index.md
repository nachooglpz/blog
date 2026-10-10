---
title: "The Power (and Limits) of Emacs Buffers"
subtitle: "Buffers are to Emacs what files are to UNIX, and that is its most powerful feat."
date: 2026-08-30
lastmod: 2026-08-30
summary: "Buffers are Emacs's most powerful tool to be \"annoyingly\" useful."
tags:
  - design
  - data-structures
  - open-source
topics:
  - open-source
  - design
  - data-structures
  - Emacs

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
  description: "Buffers are to Emacs what files are to UNIX, and that is its most powerful feat."
  image: ""
  canonical: ""
---

Alan Perlis once [famously wrote](https://www.cs.yale.edu/homes/perlis-alan/quotes.html):
> It is better to have 100 functions operate on one data structure than 10 functions on 10 data structures.

A modern example of this aphorism can be found in object-oriented programming. 
From Perlis's notion, you would rather write 100 functions for a single interface, than to write 10 functions for 10 different classes implementing that same interface.

Having the same interface and data structures to manipulate allows external functions and objects to apply the same protocols to the data structures they are working with;
and the magic lies in the fact that a programmer can implement a use case for these interfaces (or objects) that the original programmers might never have thought of!

A good example to apply this knowledge is in
[Lisp (and overall functional programming)](https://stackoverflow.com/questions/6016271/why-is-it-better-to-have-100-functions-operate-on-one-data-structure-than-10-fun),
as its basis lies in the manipulation of lists as a shared data structure to compute on.
Having several functions that allow you to manipulate the same data structure allows you to combine and implement these functions in the way that you need,
the same way as in the previous example applied to object-oriented programming.

## The buffer type

Probably one of the best implementation of an environment of functions (and plugins, or extensions) operating into the same data structure is
[Emacs](https://www.gnu.org/software/emacs/emacs.html).
The base protocol being implemented for these extensions is just the [buffer type](https://www.gnu.org/software/emacs/manual/html_node/elisp/Buffer-Type.html),
for Emacs Lisp (or elisp), the language to program any functions and extensions for the editor.

Overall, the buffer is what makes Emacs the versatile, almost OS-like editor, that the [Church of Emacs](https://www.gnu.org/fun/jokes/gospel.html)
defends in the [Editor war](https://en.wikipedia.org/wiki/Editor_war) because the buffer is to emacs what the file is to UNIX as its fundamental data structure.

Although when starting with Emacs the buffer can seem to be just a tab to represent a file, these are actually just objects that hold text that can be edited.
The official documentation establish that most buffers do hold the contents of disk files to edit them, but because a buffer can represent anything
(Alan Perlis also wrote that strings are the only communication coin we can count on), it can be used to 
[manage other text-represented data](https://news.ycombinator.com/item?id=6966500), such as binding network connections and external processes to buffers, or
allowing asynchronous streaming of incoming data into buffers to be able to transform and manipulate them.

Another part of the magic for Emacs buffers is that, because they really are independent objects, you can have buffer-local variables, transaction queues for asynchronous processes,
buffer-specific behaviors, and many other segregated functionalities implemented for each buffer.

## Operating into the same object

What inspired me to write this entry was a [vlog by Tsoding](https://www.youtube.com/watch?v=DMbrNhx2zWQ), where he describes the usefullness of Emacs as annoying
in the sense that its (useful and adaptive) design might make it difficult for any programmer to move to another editor.
And this design lies in the buffer.

As an example, Tsoding demonstrated how he frequently uses two modes in Emacs: [Dired](https://www.gnu.org/software/emacs/manual/html_node/emacs/Dired.html),
and [Multiple Cursors](https://github.com/magnars/multiple-cursors.el).
He mentioned that the developers for these programs developed them at completely different times and without designing them to be used together.
Yet, they can indeed be used together without any friction at all.

Tsoding also mentioned that when reflecting on why could this happen, he thought of how they both were made to operate inside of a buffer instance,
and this is why they can coexist and one can manipulate the other without any problem.
And from his reflection, having the buffer type as the object target for programs is what makes Emacs the powerful tool that it is,
as it allows programs to be able to be executed within each other to make a useful editor.

## Asynchronous processes

Since Emacs allows you to run different programs to modify its buffers, the historical implementation that it has done to solve this problem is through
[asynchronous processes](https://www.gnu.org/software/emacs/manual/html_node/elisp/Asynchronous-Processes.html).
This allows Emacs to run its lisp programs without halting execution of the program, allowing users to continue modifying a buffer even if the running
program has not finished its process.
This asynchronity dates back to its [first public release in 1985](https://www.gnu.org/software/emacs/history.html),
and followed the trend of [implementing event-driven design](https://medium.com/@yourstudybuddy/history-of-event-driven-concepts-b616a7afa2cb) for Graphical User Interfaces.

The [first Emacs](https://www.gnu.org/software/emacs/manual/html_node/efaq/Origin-of-the-term-Emacs.html) was developed in 1976
for the [Incompatible Timesharing System (ITS)](https://gunkies.org/wiki/Incompatible_Timesharing_System).
One of the features of ITS was that a parent process had control of a child process, allowing it to halt it, resume it, and read or write its memory.
And Richard Stallman had extended TECO (the predecesor to Emacs) with a "real time" full-screen mode, which would suggest that Emacs and its design was actually
a precursor for event-driven design for applications.

A developer on [Hacker News](https://news.ycombinator.com/item?id=6966202) described the Emacs buffer-based async handling of external processes as
> A masterpiece of software engineering, much better than things like UNIX pipes.

While in UNIX pipes bytes flow from process A to process B, Emacs buffers processes allow for the asynchronous processes to coexist inside of the application
while the programs remain easy to write under the same buffer data structure (and therefore programming under the same protocol).

## Threads

Emacs is a product of its time, and even though it might have pioneered asynchronous implementation for its processes, it was made to run on a single CPU thread.
This changed when in 2018 the editor added support for [concurrency](https://www.gnu.org/software/emacs/manual/html_node/elisp/Threads.html),
where each thread has its own current buffer and match data.

To maintain backwards compatibility with the existing implementation for Emacs,
a [process is locked to the thread that created it](https://www.gnu.org/software//emacs/manual/html_node/elisp/Processes-and-Threads.html),
and the output from that process can only be accepted by that same thread.

There are several consequences of updating the editor to allow for use of threads from its initial architecutre,
and some of the [problems](https://www.reddit.com/r/emacs/comments/utzxir/comment/i9diqxr/) were noted by [Tom Tromey](https://github.com/tromey),
one of the contributors for the existing threading code.

Tom noted that he tried the idea of having a per-buffer lock acquired by switching to the buffer.
This idea did not work because, if you wanted to start a thread, you also have to make a buffer for it, or else it would try to lock the current buffer.
Another problem with this per-buffer lock was that a process could not filter what was being written to the current buffer.

Tom also suggested that it would be possible to allevaite or remove the implementation that allows for only one Emacs Lisp thread to execute at a time.
He ntoed that there was a patch once to alleviate it a bit, which would allow thread-switches periodically, instead of during I/O; but was rejected by the maintainers.
He suggested that removing this global lock would be harder, and the main issue being that it would invole an audit
of the core Emacs codebase to make sure there would not be any data races, or heap writes to be atomic.

[Another user](https://www.reddit.com/r/emacs/comments/utzxir/comment/n4ukmri/)
suggested using [Transactional Memory](https://en.wikipedia.org/wiki/Transactional_memory)
to allow multiple threads to modify an arbitrary number of variables concurrently without locks,
and in case of collision when merging the transactions, the thread working with stale data would restart its work.
The [noted problem](https://www.reddit.com/r/emacs/comments/utzxir/comment/n5j9hff/) was that this would need a stateless and restartable design implementation
for the elisp programs for Emacs, which is not the case for the majority of existing programs.

A different user on [Hacker News](https://news.ycombinator.com/item?id=31561635)
noted that one challenge for implementation of threads on Emacs is that there are many elisp libraries that make assumptions about sequential and exlusive execution.

Tom had already concluded that the problems of adapting Emacs to thread usage made the threading work a failed experiment.

Even though the design of Emacs might not be fit for supporting multi-threading,
I would still argue that its pioneering desing focused on asynchronous processing of programs that would feed into a same buffer object,
made this nearly OS-like editor the success it became; and the [lightweight nature](https://renato.athaydes.com/posts/switching-from-heavyweight-ides-to-emacs.html) of Emacs
justified not needing different processing threads from the start.
