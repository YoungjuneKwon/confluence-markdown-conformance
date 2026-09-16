# Conversion specification

What a Confluence → Markdown exporter is expected to do, and why.

This document is the reasoning. `scripts/cases.mjs` is the same thing in
executable form, and the table at the bottom is generated from it.

---

## The governing rule

> **Degrade, never delete.**

Markdown cannot express everything Confluence can, and pretending otherwise
produces worse output than admitting it. A merged table cell, a three-column
layout, a status lozenge — none of these have a faithful Markdown form.

So the bar is not fidelity. The bar is this: **after the export, is any
information gone that a reader would have had before it?**

Three consequences follow.

1. **Text always survives.** Whatever wrapper cannot be represented, the words
   inside it come out. A layout flattens to paragraphs; a panel becomes a
   blockquote or a plain paragraph; an unknown macro yields its body.
2. **State is information.** A completed task is not decoration. Exporting
   `[x]` as `[ ]` is not a formatting compromise, it is a false statement.
3. **Structure degrades in one direction only.** Losing nesting is a bug.
   Adding a wrapper to preserve content is acceptable.

## Severity

| | Meaning | Example |
|---|---|---|
| **critical** | The export changes a fact, or content is gone | a completed task exports as incomplete |
| **major** | Information present in Confluence does not survive | a code block loses its language |
| **minor** | The output is valid but awkward | an empty cell shifts a column |

Weighted scoring uses 3 / 2 / 1.

---

## Why these particular cases

### Task state

The single most damaging thing an exporter can do, because nothing looks wrong
afterwards. Confluence stores `state: "DONE"`; Markdown has `- [x]`. There is a
direct mapping and no excuse for losing it.

### Non-ASCII titles

In docs-as-code the filename is the URL. A slug generator that strips characters
outside `[a-z0-9-]` has nothing left when the title is `한글로만 이루어진 제목`, and
falls back to something like `page-<uuid>.md`.

A correct slug either keeps the characters (every modern filesystem and Git
handle UTF-8 filenames) or transliterates them. It must never produce a name
that identifies nothing, and two different titles must never collapse to the
same name.

### Code block languages

Confluence's code macro carries a language. Markdown fences carry a language.
Dropping it loses syntax highlighting and cannot be recovered on re-import — a
round trip through such an exporter is lossy in a way the user cannot undo.

### Block content inside list items

Markdown *can* nest a code block inside a list item; it needs the continuation
indent. Exporters that emit the fence at column zero silently split one list
into several. This is checked by parsing the output with CommonMark and
comparing nesting depth, not by matching text.

### Unknown macros

Every Confluence site runs macros the exporter has never seen. Falling back to a
placeholder image that points at an authenticated wiki URL is the same as
deleting the content, because the exported file is meant to leave the wiki.
The body text must come out.

### Merged cells and layouts

These genuinely cannot be represented. That is exactly why they are in the
suite: they test whether the exporter degrades gracefully or just gives up.
Flattening a merged header into a normal row passes. Omitting it fails.

---

## Things that are deliberately not cases

**A code macro title.** Confluence Cloud's ADF has no title attribute on a code
block. When storage-format markup supplies one, Confluence rewrites it as a
heading above the block. So the title does survive, but not as part of the code
block — and asking an exporter to reattach it would be asking for something the
page does not contain.

**Anything Confluence refuses to store.** While building this corpus, a linked
image written one way was silently discarded on save: the page existed, the
section was empty, and the exporter was briefly blamed for content that had
never been there. `scripts/verify-seed.mjs` exists because of that. Run it
before scoring anything.

**Exact output formatting.** There is no golden file. `*italic*` and `_italic_`
both pass; a table with aligned pipes and one without both pass. The rules check
meaning, parsed where possible, so that an exporter is never marked down for a
defensible stylistic choice.

---

## The rules

<!-- BEGIN RULES -->

### Text and marks

| Id | Severity | Rule |
|---|---|---|
| `C1.1` | major | Marks that Markdown can express — bold, italic, strikethrough, inline code — survive. |
| `C1.8` | minor | Marks Markdown cannot express — underline, subscript, superscript — fall back to HTML rather than being flattened. |
| `C1.2` | major | Inline code containing a backtick or a pipe keeps those characters literally. |
| `C1.3` | major | Text that looks like Markdown syntax is escaped so it renders as literal characters. |
| `C1.4` | major | External links, mail links and in-page anchors are all preserved. |
| `C1.5` | major | A link to another exported page points at that page, not into the wiki. |
| `C1.6` | critical | Emoji and non-Latin text survive unchanged. |
| `C1.7` | minor | A soft line break stays a line break inside one paragraph, not a paragraph split. |
| `C1.9` | major | A quote nested inside a quote keeps its depth. |
| `C1.10` | major | Heading levels 3 through 6 are preserved as distinct levels. |

### Code blocks

| Id | Severity | Rule |
|---|---|---|
| `C2.1` | major | A code macro with a language produces a fence that declares that language. |
| `C2.2` | major | Every declared language round-trips, not just the first one. |
| `C2.4` | minor | A code macro title is not silently dropped. |
| `C2.5` | critical | A fence written inside a code block does not terminate the block early. |
| `C2.6` | major | A long line inside a code block is not wrapped. |
| `C2.7` | critical | Non-ASCII text inside a code block survives. |
| `C2.8` | major | A noformat macro becomes a code block, keeping its whitespace. |

### Lists and tasks

| Id | Severity | Rule |
|---|---|---|
| `C3.1` | critical | A completed task exports as completed. Flipping a task to incomplete changes a fact. |
| `C3.2` | major | A bullet list nested three levels deep keeps all three levels. |
| `C3.3` | major | An ordered list nested inside an ordered list stays nested. |
| `C3.5` | critical | Two paragraphs in one list item stay two paragraphs, and are never concatenated. |
| `C3.6` | critical | A code block inside a list item stays inside that item and does not split the list. |
| `C3.7` | major | A table inside a list item is not deleted. Markdown cannot nest it, so it must degrade visibly. |
| `C3.8` | major | A quote inside a list item survives. |

### Tables

| Id | Severity | Rule |
|---|---|---|
| `C4.1` | major | A table becomes a Markdown table, and inline marks inside cells survive. |
| `C4.2` | minor | Empty cells do not shift the remaining columns. |
| `C4.4` | critical | Merged cells cannot be expressed in Markdown, but their text must not be lost. |
| `C4.5` | critical | Block content inside a cell (a list, a code block, two paragraphs) is not dropped. |
| `C4.6` | minor | A line break inside a cell stays a line break. |
| `C4.8` | major | A table whose cells hold CJK text still parses as a table. |

### Media

| Id | Severity | Rule |
|---|---|---|
| `C5.1` | critical | Attached images are written out as files. |
| `C5.2` | critical | Image references in the body point at the exported files. |
| `C5.4` | major | An attachment whose name contains a space is exported and correctly referenced. |
| `C5.5` | critical | An attachment with a non-ASCII filename is exported and still identifiable. |
| `C5.6` | major | An image referenced by external URL is kept as an external reference. |
| `C5.8` | critical | An image wrapped in a link produces valid Markdown — a link containing an image. |
| `C5.9` | major | An image inside a table cell stays inside the table. |
| `C5.11` | major | A non-image attachment is exported and linked relatively, not back to a wiki URL. |

### Macros

| Id | Severity | Rule |
|---|---|---|
| `C6.1` | critical | Panel text survives. A panel with no Markdown equivalent must degrade, never delete. |
| `C6.2` | critical | Block content inside a panel survives too. |
| `C6.3` | critical | Collapsed content is still exported. Being hidden is not the same as being absent. |
| `C6.4` | major | Status lozenge text survives. |
| `C6.5` | major | Dates survive in a readable form. |
| `C6.8` | major | Excerpt text survives. |
| `C6.9` | major | An include macro does not abort the export. |
| `C6.10` | critical | An unknown third-party macro still yields its body text. |

### Layout

| Id | Severity | Rule |
|---|---|---|
| `C7.1` | critical | Column layouts flatten in reading order with no cell dropped. |
| `C7.2` | major | A code block inside a layout cell survives with its language. |

### Title hazards

| Id | Severity | Rule |
|---|---|---|
| `C8.1` | critical | No exported filename is an opaque placeholder such as page-<uuid>.md. |
| `C8.2` | critical | A page titled only in Korean still produces a filename a human can identify. |
| `C8.3` | critical | A title mixing Korean with one ASCII word does not collapse to that word alone. |
| `C8.4` | critical | Two titles that differ only in discarded characters produce two distinct files. |
| `C8.5` | major | A title containing punctuation illegal in filenames is exported safely, not dropped. |
| `C8.6` | minor | A title containing emoji is exported without crashing. |

### Embeds and diagrams

| Id | Severity | Rule |
|---|---|---|
| `C10.1` | major | A Mermaid diagram keeps its fence language, so a renderer can still draw it. |
| `C10.2` | major | PlantUML source survives as a code block even though no common renderer draws it. |
| `C10.3` | major | An HTML macro body comes out as markup, not as inert text or a comment. |
| `C10.4` | minor | Markup written directly in the page body keeps its text. |
| `C10.5` | major | A diagram macro whose picture is an attachment still shows the picture, or at least names it. |
| `C10.6` | minor | A link to an external site survives with its text and target. |

### Page tree

| Id | Severity | Rule |
|---|---|---|
| `C9.1` | critical | A bulk export reaches the whole subtree, including great-grandchildren. |
| `C9.2` | major | The exported directory structure mirrors the page hierarchy. |
| `C9.3` | critical | Every page in the corpus appears exactly once in the export. |

63 rules: 23 critical, 32 major, 8 minor.

<!-- END RULES -->
