# Results

Every score below was produced by the scripts in this repository, against the
seed corpus in `fixtures/`, on a Confluence Cloud site. Raw `--json` output is
in `results/`.

**A score without a version and a date is not a measurement.** These apps ship
often — one of them was rewritten from scratch eight days before it was tested.

| App | Version | Tested | Cases | Weighted | Critical failures |
|---|---|---|---|---|---|
| Markdown Exporter for Confluence (Narva Software) | 3.5.0 | 2026-09-16 | 47/63 | 101/141 (72%) | 9 |
| *(reference implementation — see the disclosure below)* | 0.1.0 | 2026-09-16 | 63/63 | 141/141 (100%) | 0 |

### By group

| Group | Narva 3.5.0 | Reference |
|---|---|---|
| Text and marks | 9/10 | 10/10 |
| Code blocks | 4/7 | 7/7 |
| Lists and tasks | 4/7 | 7/7 |
| Tables | **6/6** | **6/6** |
| Media | 6/8 | 8/8 |
| Macros | 7/8 | 8/8 |
| Layout | **2/2** | **2/2** |
| Title hazards | 3/6 | 6/6 |
| Embeds and diagrams | 3/6 | 6/6 |
| Page tree | **3/3** | **3/3** |

Three groups are a draw. Tables, column layouts and page-tree depth are handled
correctly by both — merged cells, block content inside cells and four levels of
hierarchy all survive either way. **The loss is not spread evenly; it is
concentrated.** Every difference below comes from one of four places: what
happens to a filename, to a fence's language, to the inside of a list item, and
to a macro nobody taught the exporter about.

### Case by case

| Case | What is at stake | Narva 3.5.0 | Reference |
|---|---|---|---|
| C1.8 | underline / sub / sup | flattened to plain text | HTML fallback |
| C2.1 · C2.2 | code block language | dropped | kept |
| C2.5 | a fence inside a code block | closes the block early | delimiter widened |
| C3.1 | a completed task | exports as **incomplete** | exports as completed |
| C3.5 | two paragraphs in one item | concatenated, no space | kept apart |
| C3.6 | a code block in a list item | escapes the list | stays indented |
| C5.8 | an image wrapped in a link | broken Markdown | one valid line |
| C5.11 | a non-image attachment | linked back to the wiki | linked relatively |
| C6.10 | an unknown macro | body replaced by a placeholder | body kept |
| C8.1 · C8.2 · C8.3 | non-ASCII page titles | `page-<uuid>.md`, `ascii.md` | the title, kept |
| C10.1 | a Mermaid diagram | language dropped, so it stops rendering | still draws |
| C10.3 | an HTML macro | body replaced by a placeholder | markup kept |
| C10.5 | a draw.io diagram | attachment exported but never referenced | referenced as an image |

### Disclosure

The second row is the author's own converter, written after the suite and not
yet released. It is here because hiding it would be worse, not because it is an
independent result — **treat it as the author marking their own homework.**

Two things are checkable rather than taken on trust. The rules were written from
failures measured in shipping apps *before* that converter existed, and the git
history shows it. And every rule is executable: if one looks tuned to a
particular implementation, it can be read, argued with, and changed.

---

## Markdown Exporter for Confluence 3.5.0

Tested 2026-09-15 on Confluence Cloud (Premium). Bulk export of the corpus root
and all descendants, "include attachments" enabled.

### What it gets right

Everything in **Tables** and **Layout** passed, which is not trivial — merged
cells, block content inside cells, and three-column layouts all kept their text.
The page tree came out four levels deep with a directory structure that mirrors
the hierarchy, and attachments were written into `attachments/` with body
references rewritten. Panels, expand bodies, status lozenges and excerpts all
survived.

| Group | Passed |
|---|---|
| Text and marks | 9/10 |
| Code blocks | 4/7 |
| Lists and tasks | 4/7 |
| Tables | 6/6 |
| Media | 6/8 |
| Macros | 7/8 |
| Layout | 2/2 |
| Title hazards | 3/6 |
| Page tree | 3/3 |

### What it breaks

**C3.1 — completed tasks export as incomplete.** `critical`

The stored ADF holds `state: "DONE"`. The export writes `- [ ]`.

```
Confluence            exported Markdown
[x] DONE — finished   - [ ] DONE — this one is finished
[x] DONE — too        - [ ] DONE — and this one too
```

This is the worst failure in the suite because it changes a fact rather than a
format, and nothing about the output looks wrong.

**C8.1 / C8.2 / C8.3 — non-ASCII titles lose their filenames.** `critical`

| Page title | Exported filename |
|---|---|
| `한글로만 이루어진 제목` | `page-4a8efd2d-de16-4708-8c4b-4138be08d249.md` |
| `日本語のタイトル` | `page-288194be-27f4-4cd1-9008-faa578dee031.md` |
| `제목에 이모지 🚀 포함` | `page-27a845d3-df72-43a2-959d-e2ea04084fbe.md` |
| `한글 문서 — 파일명과 제목에 비ASCII` | `ascii.md` |
| `릴리스 노트 2026` | `2026.md` |

Three of seven pages became opaque UUIDs. A fourth kept only its one ASCII word.
The heading inside each file is intact, so the content is not lost — but in
docs-as-code the filename is the URL, and this turns a repository into a pile of
unnamed files.

**C6.10 — an unknown third-party macro loses its body.** `critical`

The macro body text is gone, replaced by an image pointing at an authenticated
Confluence servlet:

```markdown
![](https://your-site.atlassian.net/wiki/plugins/servlet/confluence/placeholder/unknown-macro?name=...)
```

Outside the wiki that URL renders nothing. Any macro the exporter has not been
taught about takes its content with it.

**C5.8 — an image wrapped in a link produces broken Markdown.** `critical`

```markdown
[![clickable](./attachments/diagram.png)

](https://www.atlassian.com/)
```

A blank line inside a link is not a link in CommonMark. Rendered, this leaks a
literal `[` and `](https://www.atlassian.com/)` into the page.

**C3.6 — code blocks escape their list item.** `critical`

Parsed with CommonMark, the fences sit at list depth 0 in the export and list
depth 1 in the source. A three-step numbered list becomes three separate lists.

**C3.5 — two paragraphs in one list item are concatenated.** `critical`

```
source   : First paragraph of the item.
           (blank line)
           Second paragraph of the same item.
exported : First paragraph of the item.Second paragraph of the same item.
```

Not even a space between them.

**C2.5 — a fence inside a code block terminates it early.** `critical`

A code block whose content contains ```` ``` ```` is closed at that point, and the
rest of the block becomes body text followed by a stray empty code block.

**C2.1 / C2.2 — code block languages are dropped.** `major`

The ADF carries `language: python`, `shell`, `yaml`, `json`. Every exported fence
is a bare ```` ``` ````. Syntax highlighting is lost and cannot be recovered on
re-import.

**C10.1 — a Mermaid diagram stops being a diagram.** `major`

The fence loses its language, so what GitHub drew as a flowchart becomes a block
of text:

````
```                     ← should be ```mermaid
graph TD
  A[Confluence page] --> B[ADF]
```
````

**C10.3 / C10.5 — an HTML macro and a draw.io diagram both vanish into a placeholder.** `major`

Both come out as an image pointing at an authenticated Confluence servlet:

```markdown
![](https://your-site.atlassian.net/wiki/plugins/servlet/confluence/placeholder/unknown-macro?name=drawio&…)
```

The draw.io case is the sharper one. `architecture.png` **is** written into
`attachments/` — the bytes ship and nothing in the body ever points at them. The
file is in the export and the diagram is not.

**C1.8 — underline, subscript and superscript are flattened.** `minor`

```
source   : <u>underline</u>, <sub>sub</sub>, <sup>sup</sup>
exported : underline, subscript, superscript
```

Bold, italic, strikethrough and inline code all survive (C1.1 passes). These
three have no Markdown form, but every renderer in common use passes the HTML
tags through, and losing sub/sup changes meaning — `H2O` is not `H₂O`.

**C5.11 — a non-image attachment is linked back to the wiki.** `major`

The file is written into `attachments/`, but the body link points at
`https://your-site.atlassian.net/wiki/download/attachments/…`, an endpoint that
requires authentication. The exported copy is never referenced.

### Vendor's own known-issues page

At the time of testing the vendor documented four limitations: Excerpt Include
images, Page tree macro, header images, and browser memory on large exports.
None of the thirteen failures above appear there. These are not documented
trade-offs — they look like unreported bugs.
