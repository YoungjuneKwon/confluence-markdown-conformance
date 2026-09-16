# 02 Code blocks

Code macros are where exporters most often drop information. The language attribute is the usual casualty.

## C2.1 Code macro with a language

```python
def render(node: dict) -> str:
    """Convert one ADF node."""
    return node["type"]
```

## C2.2 A different language

```shell
forge deploy --environment production
forge install --site example.atlassian.net
```

## C2.3 Code macro with no language

```
plain text block
  indentation preserved
    three levels deep
```

## C2.4 Code macro with a title

##### **manifest.yml**

```yaml
modules:
  confluence:contentAction:
    - key: export
```

## C2.5 Code that contains a Markdown fence

````markdown
Here is a fence inside a code block:
```
not the end of the block
```
Still inside.
````

## C2.6 A single very long line

```shell
curl -s -H "Authorization: Bearer $TOKEN" "https://example.atlassian.net/wiki/api/v2/pages?space-id=123&limit=250&body-format=atlas_doc_format" | jq '.results[] | {id, title}'
```

## C2.7 Non-ASCII inside a code block

```json
{ "제목": "한글 값", "絵文字": "🚀" }
```

## C2.8 Preformatted (noformat) macro

```
no syntax highlighting here
    but whitespace matters
```
