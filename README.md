# confluence-markdown-conformance

A reproducible way to find out what your Confluence → Markdown exporter keeps,
and what it quietly throws away.

You seed a Confluence space with a fixed corpus, export it with whatever app you
use, and run a scorer. The scorer checks 56 rules and tells you which ones your
export breaks.

It exists because this kind of damage is invisible. A completed task that exports
as incomplete, a Korean page title that becomes `page-4a8efd2d-….md`, a code block
that loses its language — none of it throws an error. You only find out later,
in the repository you migrated to.

## Quick start

You need Node 18+ and a Confluence Cloud site where you can create a space.
Get an API token from <https://id.atlassian.com/manage-profile/security/api-tokens>.

```sh
npm install

export CONFLUENCE_BASE_URL=https://your-site.atlassian.net
export CONFLUENCE_EMAIL=you@example.com
export CONFLUENCE_API_TOKEN=...

node scripts/seed.mjs          # creates the MDCONF space, 20 pages, 7 attachments
node scripts/verify-seed.mjs   # confirms Confluence actually stored all of it
```

Then export the `Markdown Conformance Corpus` page and all of its descendants
with the app you are testing, unzip the result, and score it:

```sh
unzip export.zip -d out/my-app
node scripts/score.mjs out/my-app --label "My App 1.2.3"
```

`--json` gives machine-readable output.

### Why `verify-seed.mjs` matters

Confluence silently discards storage markup it does not accept. When that happens
the page still exists but the section is empty — and the exporter then gets blamed
for content that was never on the page. This happened while building this corpus.
**Run the verifier before you score anything.**

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
| Page tree | four levels deep, directory structure, no page exported twice |

Each rule carries a severity:

- **critical** — the export changes a fact or loses content outright
- **major** — information present in Confluence does not survive
- **minor** — the output is valid but awkward

The full rule list, with the reasoning behind each one, is in [SPEC.md](SPEC.md).

## Results

Measured results for shipping apps are in [RESULTS.md](RESULTS.md).

## The one rule behind all the others

> **Degrade, never delete.**

Markdown genuinely cannot express everything Confluence can. A merged table cell,
a three-column layout, a task list inside a panel — there is no faithful Markdown
for these. That is fine. What is not fine is dropping the text.

An exporter that flattens a layout into plain paragraphs passes. An exporter that
omits the second column fails.

## Contributing a result

Run the suite, then open a pull request adding a row to `RESULTS.md` and your
`--json` output under `results/`. Include the app version and the date — these
apps ship often, and a score without a version is not a measurement.

## Contributing a case

A good case is one that a real export can get wrong. Add the markup to a file in
`fixtures/pages/`, give the heading a `Cn.n` id, add the rule to `scripts/cases.mjs`,
then re-seed and run `verify-seed.mjs` to confirm Confluence actually stores it.

## Licence

MIT.
