# 01 Text and marks

This page exercises inline formatting and link forms. Every mark below must survive the round trip to Markdown.

<a id="c11-inline-marks"></a>

## C1.1 Inline marks

**bold**, *italic*, ***bold italic***, ~strikethrough~, underline, `inline code`, subscript, superscript.

<a id="c12-inline-code-that-contains-backticks-and-pipes"></a>

## C1.2 Inline code that contains backticks and pipes

A backtick inside code: ``a ` b``. A pipe inside code: `a | b`. An HTML-looking string: `<div class="x">`.

<a id="c13-characters-that-mean-something-in-markdown"></a>

## C1.3 Characters that mean something in Markdown

These are literal text, not formatting: \*asterisks\*, \_underscores\_, #hash, \[brackets\], (parens), |pipe|, \`backtick\`, \\backslash, 1. not-a-list.

<a id="c14-links"></a>

## C1.4 Links

- External: [Atlassian](https://www.atlassian.com/)
- External with title attribute: [Example](https://example.com/)
- Autolink style: [https://example.com/raw](https://example.com/raw)
- Mail: [hello@example.com](mailto:hello@example.com)
- Anchor on this page: [back to this section](#c14-links)
- Link text containing a bracket: [text \[with\] brackets](https://example.com/b)

<a id="c15-link-to-another-confluence-page"></a>

## C1.5 Link to another Confluence page

A native page link: [02 Code blocks](../markdown-conformance-corpus/02-code-blocks.md)

A page link with custom text: [custom label](../markdown-conformance-corpus/03-lists-and-tasks.md)

<a id="c16-emoji-and-non-latin-text"></a>

## C1.6 Emoji and non-Latin text

Emoji: 🚀 ✅ 🇰🇷. Korean: 안녕하세요. Japanese: こんにちは. Chinese: 你好. Hanja: 漢字.

<a id="c17-line-breaks"></a>

## C1.7 Line breaks

This line ends with a soft break  
and this is the same paragraph.

This is a separate paragraph.

<a id="c18-horizontal-rule"></a>

## C1.8 Horizontal rule

Before the rule.

* * *

After the rule.

<a id="c19-blockquote-including-a-nested-one"></a>

## C1.9 Blockquote, including a nested one

> Level one quote.
> 
> > Level two quote.
> > 
> > - list inside a nested quote
> 
> Back to level one.

<a id="c110-heading-depth"></a>

## C1.10 Heading depth

<a id="heading-level-3"></a>

### Heading level 3

<a id="heading-level-4"></a>

#### Heading level 4

<a id="heading-level-5"></a>

##### Heading level 5

<a id="heading-level-6"></a>

###### Heading level 6