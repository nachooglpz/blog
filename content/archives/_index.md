---
title: "Archives"
description: "A curated collection of papers, software, and links that I mostly do not own."
demo: true
outputs:
  - HTML
  - RSS

feed:
  description: "Documents, images, histories, and stubborn evidence."

content:
  format: "section"

visual:
  mode: "archive"

listing:
  featured: "/archives/tide-room-ledgers/"
  featured_label: "Open this box first"
  index_label: "Chronological index"
  filter_fields:
    - id: "topic"
      label: "Topics"
      param: "tags"
    - id: "person"
      label: "People"
      param: "archive.people"
    - id: "place"
      label: "Places"
      param: "archive.locations"
    - id: "medium"
      label: "Media"
      param: "content.media_type"
    - id: "collection"
      label: "Collections"
      param: "content.collection"
---
