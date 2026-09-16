# 06 Macros without a Markdown equivalent

These are Confluence constructs with no Markdown equivalent. The rule for all of them is the same: **degrade, never delete.**

## C6.1 Info, note, warning, tip panels

> [!NOTE]
> An info panel. Its text must survive.

> [!WARNING]
> A note panel.

> [!CAUTION]
> A warning panel with **bold** inside.

> [!TIP]
> A tip panel.

## C6.2 A panel containing block content

> [!NOTE]
> A panel that holds a list and a code block:
>
> - first
> - second
>
> ```shell
> echo "inside a panel"
> ```

## C6.3 Expand

<details>
<summary>Click to see the hidden content</summary>

Hidden body text. This must not disappear just because it is collapsed.

</details>

## C6.4 Status lozenge

Build state: **PASSED** and **FAILED**

## C6.5 A date

Due 2026-12-31, reviewed 2026-09-15.

## C6.6 Table of contents

<!-- confluence-macro: toc -->

## C6.7 Children display

<!-- confluence-macro: children -->

## C6.8 Excerpt

<!-- confluence-macro: excerpt -->

This sentence is the page excerpt.

## C6.9 Include another page

<!-- confluence-macro: include value=02 Code blocks -->

## C6.10 An unknown third-party macro

<!-- confluence-macro: some-macro-we-do-not-know key=value -->

Body of a macro the exporter has never seen.
