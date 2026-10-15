# What Confluence → Markdown exporters lose

Markdown cannot express everything Confluence can, so every exporter has to give
something up. The question is **what**, and none of them tell you.

This repository answers it by measurement. You seed a Confluence space with a
fixed corpus, export it with whatever app you use, and run a scorer. The scorer
checks **63 rules** and names the ones your export breaks.

The damage is invisible without this. A completed task that exports as
incomplete, a Korean page title that becomes `page-4a8efd2d-….md`, a fenced block
that loses its language — nothing throws an error. You find out later, in the
repository you migrated to.

---

## What the measurement found

Same seeded space, same 63 rules. Raw `--json` output is in
[`results/`](results/); a score without a version and a date is not a measurement.

| Exporter | Version | Tested | Cases | Weighted | Critical failures |
|---|---|---|---|---|---|
| **Confluence's own Markdown export** | beta | 2026-10-14 | 43/63 | **97/141 (69%)** | **7** |
| Markdown Exporter for Confluence (Narva Software) | 3.5.0 | 2026-09-16 | 46/63 | 99/141 (70%) | **9** |
| Reference implementation — **the author's own** | 0.1.0 | 2026-09-16 | 63/63 | 141/141 (100%) | 0 |

### Atlassian's built-in export loses every attachment

Confluence now exports Markdown itself. On this suite it scores **69%**, which puts
it level with a paid third-party app — but its failures are concentrated: **Media
0/8**. An image inside a table, an image wrapped in a link, an attachment whose
name contains a space, a non-image attachment — none of them come out, and nothing
in the output says so. A page whose meaning lives in a screenshot exports as a page
without the screenshot.

It is better than the paid app at the things people notice first: non-ASCII page
titles **6/6** against 3/6, lists and tasks 6/7 against 3/7.

Details and the case-by-case table: [RESULTS.md](RESULTS.md).

> ### Read the third row with suspicion
>
> It is the author's own converter, written after the suite, and it shipped on
> 2026-10-13 as *Faithful Markdown Export for Confluence*. It is in the table
> because hiding it would be worse — not because it is an independent result.
> **Treat it as the author marking their own homework.** The suite, the corpus and
> every raw output are here so you can re-run it and disagree.
>
> **Only one third-party exporter has been measured so far.** That is the honest
> size of this benchmark today. See [adding an exporter](#add-an-exporter).

**The loss is not spread evenly.** Three of the ten groups are a draw — tables,
column layouts and page-tree depth survive either way, merged cells and four
levels of hierarchy included. Everything that differs comes from four places:

1. what happens to a **filename** when the page title is not ASCII
2. what happens to a fenced block's **language**
3. what happens to anything **inside a list item**
4. what happens to a **macro the exporter was never taught about**

A few of the 63, to show what a case looks like:

| Case | What is at stake | Narva 3.5.0 |
|---|---|---|
| C3.1 | a completed task | exports as **incomplete** |
| C2.1 | a code block's language | dropped |
| C3.6 | a code block inside a list item | escapes the list |
| C6.10 | a macro nobody taught the exporter about | body replaced by a placeholder |
| C5.8 | an image wrapped in a link | broken Markdown |

Group-by-group and case-by-case tables: **[RESULTS.md](RESULTS.md)**.
Two real exports of the same space, side by side: **[samples/](samples/)** —
GitHub renders them, which is the point. One export's Mermaid diagram draws and
the other's does not.

---

## The one rule behind all 63

> **Degrade, never delete.**

There is no faithful Markdown for a merged table cell, a three-column layout, or
a task list inside a panel. That is fine. Dropping the text is not.

An exporter that flattens a layout into plain paragraphs passes. An exporter that
omits the second column fails.

---

## Run it against your exporter

Node 18+ and a Confluence Cloud site where you can create a space. Get an API
token at <https://id.atlassian.com/manage-profile/security/api-tokens>.

```sh
npm install

export CONFLUENCE_BASE_URL=https://your-site.atlassian.net
export CONFLUENCE_EMAIL=you@example.com
export CONFLUENCE_API_TOKEN=...

node scripts/seed.mjs          # creates the MDCONF space, 20 pages, 7 attachments
node scripts/verify-seed.mjs   # confirms Confluence actually stored all of it
```

Export the `Markdown Conformance Corpus` page and all of its descendants with the
app you are testing, unzip, and score:

```sh
unzip export.zip -d out/my-app
node scripts/score.mjs out/my-app --label "My App 1.2.3"
```

`--json` gives machine-readable output.

**Run `verify-seed.mjs` first.** Confluence silently discards storage markup it
does not accept; the page still exists but the section is empty, and the exporter
then gets blamed for content that was never on the page. That happened while this
corpus was being built.

---

## What is measured

| Group | Covers |
|---|---|
| Text and marks | bold, italic, strikethrough, sub/sup, escaping, links, page links, CJK, emoji, nested quotes, heading depth |
| Code blocks | language round-trip, fences inside fences, long lines, non-ASCII, `noformat` |
| Lists and tasks | **task completion state**, three-level nesting, two paragraphs in one item, code and tables inside items |
| Tables | header rows and columns, empty cells, **merged cells**, block content in cells, CJK widths |
| Media | attachments written out, relative references, spaces and non-ASCII in filenames, external URLs, linked images, non-image attachments |
| Macros | info/note/warning/tip panels, expand, status, date, excerpt, include, **unknown third-party macros** |
| Layout | column layouts flattened without losing a cell |
| Title hazards | Korean, Japanese, mixed-script, punctuation, emoji, near-colliding titles |
| Embeds and diagrams | Mermaid, PlantUML, HTML macro, raw markup, a diagram macro whose picture is an attachment, external links |
| Page tree | four levels deep, directory structure, no page exported twice |

Severities: **critical** — the export changes a fact or loses content outright ·
**major** — information present in Confluence does not survive · **minor** — the
output is valid but awkward.

The full rule list, with the reasoning behind each one, is in [SPEC.md](SPEC.md).

---

## Add an exporter

This benchmark is one third-party app wide. That is its biggest weakness, and it
is the one thing a reader can fix in an afternoon.

Run the suite against an exporter that is not here yet, then open a pull request
adding a row to [RESULTS.md](RESULTS.md) and your `--json` under `results/`.
Include the app version and the date — these apps ship often, and one of them was
rewritten from scratch eight days before it was tested.

Results are accepted **whatever they say**, including results that beat the
author's own converter.

## Add a case

A good case is one a real export can get wrong. Put the markup in
`fixtures/pages/`, give the heading a `Cn.n` id, add the rule to
`scripts/cases.mjs`, then re-seed and run `verify-seed.mjs` to confirm Confluence
actually stores it.

---

## Get told when the numbers change

These apps ship often, so every score here has a shelf life. Two ways to hear
about a re-measurement:

- **Watch → Custom → Releases** on this repository
- Mail <yjkwon@winm2m.com> with the subject `conformance updates`

## Licence

MIT.
