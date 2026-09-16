# 02 Code blocks

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