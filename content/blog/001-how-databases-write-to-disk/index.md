---
title: "How Databases Write to Disk"
subtitle: "How do databases talk with the kernel and disk?"
date: 2026-08-25
lastmod: 2026-08-25
summary: "A successful write by a database does not necessarily mean durability on disk."
tags:
  - storage
  - Linux
  - database
topics:
  - databases
  - syscalls
  - i/o

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
  description: "How do databases talk with the kernel and disk?"
  image: ""
  canonical: ""
---

One of the core sections of a Database Management System is the [Buffer Manager](https://cs186berkeley.net/notes/note5/).
It is responsible for managing which "pages" of data are stored in memory, and processing page requests that the [File and Index Manager](https://cs186berkeley.net/notes/note4/)
makes to fetch data.

Because a database already has a buffer manager,
it might be better to actually bypass the operating system's buffer cache as the policies that an operating system and a database system implement
to store pages in their caches may differ.
This is why a database system often also implements its own [Disk Space Management](https://cs186berkeley.net/notes/note5/) module.
This is the module that allows the buffer manager to retrieve pages from disk when the database needs to process them,
or flush pages back to the storage disk when the buffer manager decides they are not needed anymore.

But to be able to bypass the operating system's cache, and to be able to request data pages directly from the storage disk,
a DBMS needs to fetch data using a different approach.

## Reading data

The first thing that a database does when working with data is to fetch it.
To be able to make a `read()` call to the kernel without storing the page in the kernel's cache, one can just use the `O_DIRECT` flag to enable direct I/O when opening the file.

```c
int fd = open("file", O_DIRECT);
read(fd, buffer, 4096);
```

It is important to note that `O_DIRECT` [requires that buffer, offset,
and I/O size align to the block size](https://linuxvox.com/blog/what-does-o-direct-really-mean/#how-to-use-o_direct),
since the database is also bypassing the kernel's ability to reshape the request into block-device-friendly operations; although this depends on the filesystem,
kernel, and the storage device.

Now the data is stored in a buffer to be able to manipulate it.

## Writing data

Once the database has finished manipulating the buffer, or needs to flush the changes back to disk, one can simply use a `write()` call.

```c
write(fd, buffer, 4096);
```

In a normal case, if the file was opened without the `O_DIRECT` flag, the `write()` call would return once the page was written to the kernel's page cache,
and the kernel may write it to storage later.
But since we are using `O_DIRECT`, the I/O operation bypasses most of the kernel's cache and goes directly to disk.
It might also be important to remember that when doing a `write()` call, the kernel blocks this page until the call returns.

## Shared buffers and `fsync()`

With the previous approach, every time that a page is being written it needs to be flushed to disk bypassing the kernel's cache, and this can be quite performance costly.
Databases like [PostgreSQL](https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-SHARED-BUFFERS) implement what they call `shared_buffers`.

PostgreSQL actually accepts the trade-off of double buffering. This might have the advantage of keeping control of its own buffer cache
to keep database semantics, while minimizing the performance penalty of a cache miss if the page that the database wants to retrieve still remains in the kernel's page cache.
PostgreSQL developers have designed its buffer management with the assumption that the OS cache is useful.
Yet, a possible critique to this technique might be that when using a shared buffer, the database might be wasting space with some data pages being repeated in both buffer caches.

There are still operations where data pages still need to be written to disk just after they happen in the database,
like writes to the [Write Ahead Log](https://stackoverflow.com/questions/58694102/how-could-wal-write-ahead-log-have-better-performance-than-write-directly-to-d) (or WAL)
which might be useful for database transaction processing.
The way that they ask the kernel to flush these pages is through the `fsync()` call.

The database might be performing a series of writes, which will be stored in the kernel cache, and then the database will ask the kernel to flush the buffer back to disk.

```c
int fd = open("file", O_RDWR);

write(fd, buffer, 4096);
write(fd, buffer, 4096);
write(fd, buffer, 4096);

fsync(fd);
```

Other embedded databases also rely on buffered I/O and kernel page cache.

## Persistence

Everything has probably seemed straightforward up to this point, but the *pièce de résistance* lies in the persistence of the `write()` operation that the database wants to make.

Making a direct write, or using `fsync()` to flush a page to disk, does not mean that the write will persist on disk.
[Phil Eaton](https://eatonphil.com/) once made a list of [Things that go wrong with disk IO](https://notes.eatonphil.com/2025-03-27-things-that-go-wrong-with-disk-io.html).

The ones concerning the aforementioned write mechanisms are the following.

1. **Data got corrupted**

    Data might corrupt at any moment during the journey from the computer's memory to disk.
    One defense against silent corruption is to store checksums alongside data and verify them when the data is read.
    Databases like PostgreSQL before version 18 (PostgreSQL 18 now does) and SQLite do not checksum, though.
    Another caveat is that, once a corruption has been detected, recovery requires another source of data, such as WAL, a replica, redundant storage, etc.

2. **Data was partially written**

    When a page arrives to disk it is possible that some sectors of the disk where that page belongs get written,
    and then the system crashes without the page being fully written on disk.

    This is called a torn write.
    A way to overcome this issue might be to duplicate all the writes, although it is important to note the tradeoff that a twice-as-costly write would represent.
    [Other ways](https://transactional.blog/blog/2025-torn-writes) include logging page deltas, Copy-On-Write B-Trees or Copy on First Write.

3. **Data did not reach disk**

    [Most drives contain a volatile write cache to speed up sequential
    writes](https://martinuke0.github.io/posts/2026-05-16-the-durability-guarantees-that-fsync-does-not-actually-provide/),
    and because the write operations return once the file descriptor is transferred to the hardware device,
    the kernel washes its hands after it delivers the page to the hardware and forgets about it.
    The hardware might store this write on its own cache and, in case of a hardware crash, the write might be lost; although
    it is important to note that [modern standards](https://martinuke0.github.io/posts/2026-05-16-the-durability-guarantees-that-fsync-does-not-actually-provide/) for persistent writes,
    like Force Unit Access (FUA), allow to guarantee a write once the page arrives to the hardware.

4. **`fsync()` failed**

    `fsync()` does not guarantee to succeed, and when it fails, it reports a failure to all file descriptions that were open at the time of failure,
    and the only way to know if your write did actually fail is to read again the page.
    The only way to know which exact write failed is through `O_DIRECT`.

## Fsyncgate

When `fsync()` fails, the kernel returns the error code and considers its job done: it is now the program's problem to recover.
Before 2018, [PostgreSQL was hoping that whenever `fsync()` failed, the kernel would remember the partial write and try again
later](https://www.reddit.com/r/programming/comments/cg1ip8/comment/euejh9a/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button)
until an `fsync()` would work and store the data on disk.
PostgreSQL assumed that the dirty data would remain available for a later synchronization attempt.

There were some problems with this approach. The first one is that if the write to disk was failing, you still had to store the data somewhere,
so the kernel and database buffers would fill up. Second was the implementation that was made using this API: when two processes tried to write to the same file,
but the first process did not flush with `fsync()`, the kernel scheduled the buffer's flush to disk at a later time. But then a second process would submit a write
(again, without `fsync()`) and the kernel decided that it was time to flush this write to disk, but discovered that the write did not work,
and reported the failure to the second process.
The first process decided to flush its changes to disk using `fsync()`, and because there were no pending writes, the operation would succeed.

From the kernel's point of view, this was consistent: it reported the error when the first flush failed, and when the `fsync()` call was made, since there were no pending
writes, there was nothing to do, and did not return an error.
But from an application's point of view, this might not have been the optimal behavior, as the first process did a write and an `fsync()`, and got no error.

This led to a user finding [data corruption after a storage error](https://danluu.com/fsyncgate/), and what would be later known as 'Fsyncgate'.

## Completion semantics

When using `O_DIRECT`, the kernel avoids copying data from user space into kernel space, and it instead writes it directly via DMA (Direct Memory Access).
But there is no guarantee that the call will return only after *all* data has been transferred,
so the kernel may see the write operation finished before the data is physically written to disk.

I previously mentioned that there are modern standards for persistent writes, and one of them is what we know as
[Forced Unit Access (FUA)](https://secure.jadeworld.com/developer-centre/JADE2020/OnlineDocumentation/content/resources/wp_envconsiderations/envconsiderations/forcedunitaccess.htm).
When we enforce FUA on a `write()` command, the operation will return once the buffer is written to disk (and not the disk's cache).

There are [two flags](https://www.linuxquestions.org/questions/linux-general-1/o_sync-vs-o_dsync-4175616852-print/) that enable completion semantics:

1. `O_SYNC` guarantees that the contents of the file are written to disk.
2. `O_DSYNC` guarantees not only that the file has been written to disk, but its metadata as well.

It is important to note that using either of these flags does not mean that the program is bypassing the disk's cache, but instead,
the hardware is guaranteeing that data being written will persists.
The mechanism to do so depends on the hardware, as there are HDDs and SSDs that implement non-volatile cache that ensure that even in a crash or power failure,
data still manages to be flushed inside of the hardware.

## Another approach to `O_DIRECT`

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
