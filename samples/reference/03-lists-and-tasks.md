# 03 Lists and tasks

Task state is the single most damaging thing an exporter can get wrong: a completed item that exports as incomplete changes a fact, not a format.

## C3.1 Task list with mixed state

- [ ] Not done yet
- [x] DONE — this one is finished
- [x] DONE — and this one too
- [ ] Still open, with **bold** and `code`

## C3.2 Bullet list nested three levels

- Level one A

  - Level two A-1

    - Level three A-1-a
    - Level three A-1-b
  - Level two A-2
- Level one B

## C3.3 Ordered list nested inside an ordered list

1. First

   1. First of the inner list
   2. Second of the inner list
2. Second

## C3.4 Mixed ordered and bullet nesting

1. Ordered outer

   - Bullet inner

     1. Ordered innermost

## C3.5 A list item containing two paragraphs

- First paragraph of the item.

  Second paragraph of the same item. These two must not be glued together.
- A second item.

## C3.6 A list item containing a code block

1. Install it.

   ```shell
   npm install -g @forge/cli
   ```
2. Then verify.
3. Done.

## C3.7 A list item containing a table

- An item with a table attached.

  | Key | Value |
  | --- | --- |
  | a | 1 |
  | b | 2 |

## C3.8 A list item containing a nested quote

- Item with a quote.

  > Quoted inside a list item.
