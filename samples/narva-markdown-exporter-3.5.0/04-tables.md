# 04 Tables

Confluence tables can hold block content and merged cells. Markdown tables cannot. What an exporter does at that boundary is the whole test.

<a id="c41-a-plain-table-with-a-header-row"></a>

## C4.1 A plain table with a header row

| Field | Type | Notes |
| --- | --- | --- |
| spaceKey | `string` | Target space |
| body | `object` | Contains a pipe: `a \| b` |
| labels | `string[]` | **bold**, *italic*, [a link](https://example.com/) |

<a id="c42-a-table-with-an-empty-cell-and-a-missing-value"></a>

## C4.2 A table with an empty cell and a missing value

| A   | B   |
| --- | --- |
| filled |     |
|     | filled |

<a id="c43-a-table-with-a-header-column-as-well-as-a-header-row"></a>

## C4.3 A table with a header column as well as a header row

|     | Cloud | Data Center |
| --- | --- | --- |
| Import | yes | yes |
| Export | yes | no  |

<a id="c44-a-table-with-merged-cells-colspan-and-rowspan"></a>

## C4.4 A table with merged cells (colspan and rowspan)

| Merged header across two columns |     | Third |
| --- | --- | --- |
| Spans two rows | b1  | c1  |
| b2  | c2  |

<a id="c45-a-cell-containing-block-content"></a>

## C4.5 A cell containing block content

| Case | Content |
| --- | --- |
| list in a cell | - one<br>- two |
| code in a cell | ```<br>{"a": 1}<br>``` |
| two paragraphs | First.<br><br>Second. |

<a id="c46-a-cell-containing-a-line-break"></a>

## C4.6 A cell containing a line break

| Item | Value |
| --- | --- |
| multiline | first line  <br>second line |

<a id="c47-a-wide-table"></a>

## C4.7 A wide table

| c1  | c2  | c3  | c4  | c5  | c6  | c7  | c8  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   |

<a id="c48-cjk-column-widths"></a>

## C4.8 CJK column widths

| 항목  | 값   |
| --- | --- |
| 아주 긴 한글 항목 이름입니다 | 값   |
| ASCII | v   |