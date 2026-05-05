---
title: "Why we built Inbind"
date: "2026-04-04"
lead: "We were tired of pasting the same brand voice into ChatGPT every morning. So we made a notebook the AI agent could just read."
---

This is going to be the most honest about-the-product post we'll ever write, because we're three months in and we still remember why we started.

## The pasting problem

Last summer, the four of us were running a small marketing studio. Every project had a brand voice doc. Every doc had a folder of past examples. Every AI session started with us pasting both into the prompt, hoping the model would hold onto them.

It didn't always. The output drifted. We'd notice three drafts in. Re-paste. Repeat.

This was bad in two ways. First, it wasted time. Second, it made the AI feel like a stranger we kept re-introducing ourselves to. We wanted it to feel like a colleague who had read the wiki on day one.

## What we actually built

Inbind is a desktop Markdown editor with a sidebar AI panel. The panel reads the folder you opened. That's the whole magic. No pasting. No "context window" gymnastics.

Under the hood it's `.md` files, a Git client, an editor, and a chat panel that calls Anthropic or OpenAI (or your local model) with the right files in scope.

## What we're still figuring out

How big a folder can the agent really read? What about images? Should team plans share AI history or keep it private per person? We don't know yet. We're shipping weekly and we want to get this right.

> Real, by the way: when we hit beta we had nine bug reports in the first hour. We loved every one. Keep them coming.

## What you can do

- Download Inbind. It's free.
- Open an issue when something's weird. We answer them.
- Tell us what you're writing. We learn from your folders, anonymized.

Thanks for reading. We're glad you're here.
