# Results

Every score below was produced by the scripts in this repository, against the
seed corpus in `fixtures/`, on a Confluence Cloud site. Raw `--json` output is
in `results/`.

**A score without a version and a date is not a measurement.** These apps ship
often — one of them was rewritten from scratch eight days before it was tested.

| App | Version | Tested | Cases | Weighted | Critical failures |
|---|---|---|---|---|---|
| Markdown Exporter for Confluence (Narva Software) | 3.5.0 | 2026-09-15 | 43/56 | 95/130 (73%) | 9 |

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
| Text and marks | 8/9 |
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

**C1.1 — strikethrough, underline, subscript and superscript are flattened.** `major`

```
source   : <s>strikethrough</s>, <u>underline</u>, <sub>sub</sub>, <sup>sup</sup>
exported : strikethrough, underline, subscript, superscript
```

Bold and italic survive. Strikethrough matters most here — it usually means
"this is no longer true", and the export silently makes it true again.

**C5.11 — a non-image attachment is linked back to the wiki.** `major`

The file is written into `attachments/`, but the body link points at
`https://your-site.atlassian.net/wiki/download/attachments/…`, an endpoint that
requires authentication. The exported copy is never referenced.

### Vendor's own known-issues page

At the time of testing the vendor documented four limitations: Excerpt Include
images, Page tree macro, header images, and browser memory on large exports.
None of the thirteen failures above appear there. These are not documented
trade-offs — they look like unreported bugs.
