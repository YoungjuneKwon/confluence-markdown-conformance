# 01 Text and marks

This page exercises inline formatting and link forms. Every mark below must
survive the round trip to Markdown.

## C1.1 Inline marks

**bold**, *italic*, ***bold italic***,
~~strikethrough~~,
<u>underline</u>, `inline code`,
<sub>subscript</sub>, <sup>superscript</sup>.

## C1.2 Inline code that contains backticks and pipes

A backtick inside code: ``a ` b``. A pipe inside code: `a | b`.
An HTML-looking string: `<div class="x">`.

## C1.3 Characters that mean something in Markdown

These are literal text, not formatting: \*asterisks\*, \_underscores\_, #hash,
\[brackets\], (parens), |pipe|, \`backtick\`, \\backslash, 1. not-a-list.

## C1.4 Links

- External: [Atlassian](https://www.atlassian.com/)
- External with title attribute: [Example](https://example.com/)
- Autolink style: [https://example.com/raw](https://example.com/raw)
- Mail: [hello@example.com](mailto:hello@example.com)
- Anchor on this page: [back to this section](#C14-Links)
- Link text containing a bracket: [text \[with\] brackets](https://example.com/b)

## C1.5 Link to another Confluence page

A native page link: [02 Code blocks](./02-code-blocks.md)

A page link with custom text:
[custom label](./03-lists-and-tasks.md)

## C1.6 Emoji and non-Latin text

Emoji: 🚀 ✅ 🇰🇷. Korean: 안녕하세요. Japanese: こんにちは. Chinese: 你好. Hanja: 漢字.

## C1.7 Line breaks

This line ends with a soft break  
and this is the same paragraph.

This is a separate paragraph.

## C1.8 Horizontal rule

Before the rule.

---

After the rule.

## C1.9 Blockquote, including a nested one

> Level one quote.
>
> > Level two quote.
> >
> > - list inside a nested quote
>
> Back to level one.

## C1.10 Heading depth

### Heading level 3

#### Heading level 4

##### Heading level 5

###### Heading level 6
