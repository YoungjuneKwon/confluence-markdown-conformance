# Sample exports

The same Confluence space, exported by two apps on 2026-09-16. Open the files on
GitHub and the difference renders itself — you do not have to take the scores on
trust.

| | |
|---|---|
| [`narva-markdown-exporter-3.5.0/`](narva-markdown-exporter-3.5.0/) | Markdown Exporter for Confluence 3.5.0 |
| [`reference/`](reference/) | the reference implementation in this repository's `RESULTS.md` |

## Where to look first

**The file list itself.** Open `08-title-hazards/` in both. One directory names
its pages; the other has `page-4a8efd2d-….md`, `page-288194be-….md` and
`ascii.md`.

**`10-embeds-and-diagrams.md`.** GitHub draws the Mermaid diagram in one and
prints it as text in the other, because only one of the two kept `mermaid` on the
fence. Further down, the draw.io diagram is an image in one and a link to an
authenticated Confluence servlet in the other — even though both exports contain
`attachments/architecture.png`.

**`03-lists-and-tasks.md`.** Look at the checkboxes under C3.1. Two of the four
tasks were complete in Confluence.

**`02-code-blocks.md`.** One export's fences declare `python`, `bash`, `yaml`,
`json`; the other's declare nothing.

These files are generated output, not hand-written. Re-create them with
`scripts/seed.mjs`, export with the app of your choice, and compare.
