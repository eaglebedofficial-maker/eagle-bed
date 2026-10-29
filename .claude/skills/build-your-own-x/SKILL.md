---
name: build-your-own-x
description: Find step-by-step tutorials for re-creating a technology from scratch (database, Git, Docker, web server, search engine, bot, game, programming language, neural network, OS and more) from the codecrafters-io/build-your-own-x list. Use when the user asks how to build their own X, wants a from-scratch learning guide, or wants tutorial links for implementing a technology in a given language.
---

# Build your own X

`references/tutorials.md` is a copy of the
[codecrafters-io/build-your-own-x](https://github.com/codecrafters-io/build-your-own-x)
README: about 360 tutorials grouped under 31 `#### Build your own <X>` headings.
Each entry reads `* [**Language**: _Title_](url)`, with optional `[video]`.

## How to answer

1. Map the request to one or more headings (for example "chatbot" → Bot,
   "key-value store" → Database, "HTTP server" → Web Server). Read only those
   sections, using `grep -n "^#### " references/tutorials.md` to find their
   line ranges.
2. Filter by the language the user named, or the project's own language when
   none is named. Say so when no tutorial exists for that language.
3. Return a short list: language, title and link, marking video entries.
   Recommend one starting point and say why (scope, language, completeness).
4. If nothing fits, check the "Uncategorized" section before saying none exists.

The list is a snapshot; links can go stale. When a link matters, check that it
still loads before relying on it. To refresh the snapshot, copy the current
README from the upstream repository over `references/tutorials.md`.
