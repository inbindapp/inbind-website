---
title: "The first-launch popup, explained"
date: "2026-03-21"
lead: "macOS will ask if you really want to open Inbind the first time. Here's why, and what we did about it."
---

A few people pinged us last week: "I downloaded the app and macOS won't let me open it." This post is for them, and for the next batch of people who will hit the same thing.

## What you're seeing

The first time you open a downloaded macOS app, the operating system runs a check called Gatekeeper. If the app is signed and notarized, macOS shows a one-time confirmation. If it isn't, macOS blocks it.

Inbind is signed and notarized. So you'll see the confirmation, not the block. You click Open, you go.

## Why we don't hide this

We could pretend the popup doesn't happen. We won't. We'd rather you know what to expect than feel surprised.

## What if I see "Inbind cannot be opened"?

Right-click the app icon and choose Open. Click Open again in the dialog. After that, it launches normally forever. If it still won't budge, your Mac is on a managed network with stricter rules. Email us at hello@inbind.app and we'll figure it out together.

That's the whole thing. Sorry for the friction. We'll keep working on smoothing it out.
