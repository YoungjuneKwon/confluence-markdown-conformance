# 10 Embeds and diagrams

Diagrams and embedded markup are where "degrade, never delete" is easiest to get wrong, because the thing that is lost is a picture rather than a sentence.

<a id="c101-mermaid"></a>

## C10.1 Mermaid

Mermaid is drawn by GitHub, GitLab and most static site generators — but only when the fence declares the language. Drop it and a diagram becomes a text dump.

```
graph TD
  A[Confluence page] --> B[ADF]
  B --> C[Markdown]
  C --> A
```

<a id="c102-plantuml"></a>

## C10.2 PlantUML

No common renderer draws PlantUML, so preserving the source is the whole job.

```
@startuml
actor User
User -> Exporter : export space
Exporter --> User : markdown
@enduml
```

<a id="c103-html-macro"></a>

## C10.3 HTML macro

An HTML macro exists to emit markup. Keeping the characters but losing the markup keeps the letter of the rule and breaks its spirit.

![](https://winm2m.atlassian.net/wiki/plugins/servlet/confluence/placeholder/unknown-macro?name=html&locale=en_US&version=2)

<a id="c104-raw-markup-in-the-page-body"></a>

## C10.4 Raw markup in the page body

**raw markup body**

<a id="c105-a-diagram-macro-whose-picture-is-an-attachment"></a>

## C10.5 A diagram macro whose picture is an attachment

draw.io and Gliffy store the rendered picture as an attachment and keep only its name in the macro. An exporter that copies the attachment but never references it has shipped the bytes and lost the diagram.

![](https://winm2m.atlassian.net/wiki/plugins/servlet/confluence/placeholder/unknown-macro?name=drawio&locale=en_US&version=2)

<a id="c106-smart-link-to-an-external-site"></a>

## C10.6 Smart link to an external site

See [the conformance suite](https://github.com/YoungjuneKwon/confluence-markdown-conformance).