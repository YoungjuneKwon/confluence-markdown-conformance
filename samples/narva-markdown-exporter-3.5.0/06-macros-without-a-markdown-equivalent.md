# 06 Macros without a Markdown equivalent

These are Confluence constructs with no Markdown equivalent. The rule for all of them is the same: **degrade, never delete.**

<a id="c61-info-note-warning-tip-panels"></a>

## C6.1 Info, note, warning, tip panels

> [!INFO]
> An info panel. Its text must survive.

> [!WARNING]
> A note panel.

> [!CAUTION]
> A warning panel with **bold** inside.

> [!TIP]
> A tip panel.

<a id="c62-a-panel-containing-block-content"></a>

## C6.2 A panel containing block content

> [!INFO]
> A panel that holds a list and a code block:
> - first
> - second
> ```
> echo "inside a panel"
> ```

<a id="c63-expand"></a>

## C6.3 Expand

![](https://winm2m.atlassian.net/wiki/images/icons/grey_arrow_down.png)

Click to see the hidden content

Hidden body text. This must not disappear just because it is collapsed.

<a id="c64-status-lozenge"></a>

## C6.4 Status lozenge

Build state: PASSED and FAILED

<a id="c65-a-date"></a>

## C6.5 A date

Due 31 Dec 2026, reviewed 15 Sep 2026.

<a id="c66-table-of-contents"></a>

## C6.6 Table of contents

- [C6.1 Info, note, warning, tip panels](#c61-info-note-warning-tip-panels)
- [C6.2 A panel containing block content](#c62-a-panel-containing-block-content)
- [C6.3 Expand](#c63-expand)
- [C6.4 Status lozenge](#c64-status-lozenge)
- [C6.5 A date](#c65-a-date)
- [C6.6 Table of contents](#c66-table-of-contents)
- [C6.7 Children display](#c67-children-display)
- [C6.8 Excerpt](#c68-excerpt)
- [C6.9 Include another page](#c69-include-another-page)
- [C2.1 Code macro with a language](#c21-code-macro-with-a-language)
- [C2.2 A different language](#c22-a-different-language)
- [C2.3 Code macro with no language](#c23-code-macro-with-no-language)
- [C2.4 Code macro with a title](#c24-code-macro-with-a-title)
- [C2.5 Code that contains a Markdown fence](#c25-code-that-contains-a-markdown-fence)
- [C2.6 A single very long line](#c26-a-single-very-long-line)
- [C2.7 Non-ASCII inside a code block](#c27-non-ascii-inside-a-code-block)
- [C2.8 Preformatted (noformat) macro](#c28-preformatted-noformat-macro)
- [C6.10 An unknown third-party macro](#c610-an-unknown-third-party-macro)

<a id="c67-children-display"></a>

## C6.7 Children display

<a id="c68-excerpt"></a>

## C6.8 Excerpt

This sentence is the page excerpt.

<a id="c69-include-another-page"></a>

## C6.9 Include another page

Code macros are where exporters most often drop information. The language attribute is the usual casualty.

<a id="c21-code-macro-with-a-language"></a>

## C2.1 Code macro with a language

```
def render(node: dict) -> str:
    """Convert one ADF node."""
    return node["type"]

```

<a id="c22-a-different-language"></a>

## C2.2 A different language

```
forge deploy --environment production
forge install --site example.atlassian.net

```

<a id="c23-code-macro-with-no-language"></a>

## C2.3 Code macro with no language

```
plain text block
  indentation preserved
    three levels deep

```

<a id="c24-code-macro-with-a-title"></a>

## C2.4 Code macro with a title

**manifest.yml**

```
modules:
  confluence:contentAction:
    - key: export

```

<a id="c25-code-that-contains-a-markdown-fence"></a>

## C2.5 Code that contains a Markdown fence

```
Here is a fence inside a code block:
```
not the end of the block
```
Still inside.

```

<a id="c26-a-single-very-long-line"></a>

## C2.6 A single very long line

```
curl -s -H "Authorization: Bearer $TOKEN" "https://example.atlassian.net/wiki/api/v2/pages?space-id=123&limit=250&body-format=atlas_doc_format" | jq '.results[] | {id, title}'

```

<a id="c27-non-ascii-inside-a-code-block"></a>

## C2.7 Non-ASCII inside a code block

```
{ "제목": "한글 값", "絵文字": "🚀" }

```

<a id="c28-preformatted-noformat-macro"></a>

## C2.8 Preformatted (noformat) macro

> [!NOTE]
> ```
> no syntax highlighting here
>     but whitespace matters
> 
> ```

<a id="c610-an-unknown-third-party-macro"></a>

## C6.10 An unknown third-party macro

![](https://winm2m.atlassian.net/wiki/plugins/servlet/confluence/placeholder/unknown-macro?name=some-macro-we-do-not-know&locale=en_US&version=2)