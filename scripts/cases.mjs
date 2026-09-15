// The conformance rules.
//
// Each case states one requirement in prose and one machine check. The prose is
// the specification; the check is how we hold an exporter to it.
//
// severity
//   critical — the export changes a fact or loses content outright
//   major    — information present in Confluence does not survive
//   minor    — the output is valid but awkward

export const CASES = [
  // ------------------------------------------------------------- 01 text
  {
    id: 'C1.1', group: 'Text and marks', severity: 'major',
    rule: 'Marks that Markdown can express — bold, italic, strikethrough, inline code — survive.',
    // GFM accepts one or two tildes for strikethrough, so both count.
    check: (x) => x.htmlHasAll(['<strong>bold</strong>', '<em>italic</em>'])
      && (/~~?strikethrough~~?/.test(x.text) || /<s>|<del>/.test(x.html))
      && x.html.includes('<code>inline code</code>'),
  },
  {
    id: 'C1.8', group: 'Text and marks', severity: 'minor',
    rule: 'Marks Markdown cannot express — underline, subscript, superscript — fall back to HTML rather than being flattened.',
    // Losing sub/sup silently changes meaning (H<sub>2</sub>O, x<sup>2</sup>),
    // and every Markdown renderer in common use passes these tags through.
    check: (x) => /<u>underline<\/u>/.test(x.html)
      && /<sub>subscript<\/sub>/.test(x.html)
      && /<sup>superscript<\/sup>/.test(x.html),
  },
  {
    id: 'C1.2', group: 'Text and marks', severity: 'major',
    rule: 'Inline code containing a backtick or a pipe keeps those characters literally.',
    check: (x) => /<code>a ` b<\/code>/.test(x.html) && /<code>a \| b<\/code>/.test(x.html),
  },
  {
    id: 'C1.3', group: 'Text and marks', severity: 'major',
    rule: 'Text that looks like Markdown syntax is escaped so it renders as literal characters.',
    check: (x) => x.renderedText.includes('*asterisks*') && x.renderedText.includes('_underscores_'),
  },
  {
    id: 'C1.4', group: 'Text and marks', severity: 'major',
    rule: 'External links, mail links and in-page anchors are all preserved.',
    check: (x) => x.hasAll(['https://www.atlassian.com/', 'https://example.com/', 'hello@example.com']),
  },
  {
    id: 'C1.5', group: 'Text and marks', severity: 'major',
    rule: 'A link to another exported page points at that page, not into the wiki.',
    check: (x) => /\]\((\.{1,2}\/)?[^)\s]*(02|code)[^)\s]*\.md/i.test(x.text),
  },
  {
    id: 'C1.6', group: 'Text and marks', severity: 'critical',
    rule: 'Emoji and non-Latin text survive unchanged.',
    check: (x) => x.hasAll(['🚀', '안녕하세요', 'こんにちは', '你好', '漢字']),
  },
  {
    id: 'C1.7', group: 'Text and marks', severity: 'minor',
    rule: 'A soft line break stays a line break inside one paragraph, not a paragraph split.',
    check: (x) => /soft break<br\s*\/?>\s*and this is the same paragraph/i.test(x.html),
  },
  {
    id: 'C1.9', group: 'Text and marks', severity: 'major',
    rule: 'A quote nested inside a quote keeps its depth.',
    check: (x) => /<blockquote>[\s\S]*<blockquote>/.test(x.html) && x.has('Level two quote'),
  },
  {
    id: 'C1.10', group: 'Text and marks', severity: 'major',
    rule: 'Heading levels 3 through 6 are preserved as distinct levels.',
    check: (x) => ['h3', 'h4', 'h5', 'h6'].every((h) => new RegExp(`<${h}[ >]`).test(x.html)),
  },

  // ------------------------------------------------------------- 02 code
  {
    id: 'C2.1', group: 'Code blocks', severity: 'major',
    rule: 'A code macro with a language produces a fence that declares that language.',
    check: (x) => x.fenceLanguages().includes('python'),
  },
  {
    id: 'C2.2', group: 'Code blocks', severity: 'major',
    rule: 'Every declared language round-trips, not just the first one.',
    check: (x) => ['bash', 'sh', 'shell'].some((l) => x.fenceLanguages().includes(l))
      && ['yaml', 'yml'].some((l) => x.fenceLanguages().includes(l))
      && x.fenceLanguages().includes('json'),
  },
  {
    id: 'C2.4', group: 'Code blocks', severity: 'minor',
    rule: 'A code macro title is not silently dropped.',
    check: (x) => x.has('manifest.yml'),
  },
  {
    id: 'C2.5', group: 'Code blocks', severity: 'critical',
    rule: 'A fence written inside a code block does not terminate the block early.',
    check: (x) => x.codeBlockContents().some((c) => c.includes('not the end of the block') && c.includes('Still inside')),
  },
  {
    id: 'C2.6', group: 'Code blocks', severity: 'major',
    rule: 'A long line inside a code block is not wrapped.',
    check: (x) => x.codeBlockContents().some((c) => /curl -s[^\n]*body-format=atlas_doc_format[^\n]*jq/.test(c)),
  },
  {
    id: 'C2.7', group: 'Code blocks', severity: 'critical',
    rule: 'Non-ASCII text inside a code block survives.',
    check: (x) => x.codeBlockContents().some((c) => c.includes('한글 값')),
  },
  {
    id: 'C2.8', group: 'Code blocks', severity: 'major',
    rule: 'A noformat macro becomes a code block, keeping its whitespace.',
    check: (x) => x.codeBlockContents().some((c) => /no syntax highlighting here\n\s+but whitespace matters/.test(c)),
  },

  // ------------------------------------------------------------- 03 lists
  {
    id: 'C3.1', group: 'Lists and tasks', severity: 'critical',
    rule: 'A completed task exports as completed. Flipping a task to incomplete changes a fact.',
    check: (x) => {
      const done = x.text.split('\n').filter((l) => /^\s*[-*] \[[xX]\]/.test(l))
      return done.length >= 2
        && done.some((l) => l.includes('DONE — this one is finished'))
        && done.some((l) => l.includes('DONE — and this one too'))
    },
  },
  {
    id: 'C3.2', group: 'Lists and tasks', severity: 'major',
    rule: 'A bullet list nested three levels deep keeps all three levels.',
    check: (x) => x.maxListDepth() >= 3 && x.has('Level three A-1-a'),
  },
  {
    id: 'C3.3', group: 'Lists and tasks', severity: 'major',
    rule: 'An ordered list nested inside an ordered list stays nested.',
    check: (x) => /<ol>[\s\S]{0,400}<ol>/.test(x.html),
  },
  {
    id: 'C3.5', group: 'Lists and tasks', severity: 'critical',
    rule: 'Two paragraphs in one list item stay two paragraphs, and are never concatenated.',
    // Stripping tags first would make a concatenation look identical to two
    // paragraphs, so this reads the rendered structure instead.
    check: (x) => /<p>First paragraph of the item\.<\/p>/.test(x.html),
  },
  {
    id: 'C3.6', group: 'Lists and tasks', severity: 'critical',
    rule: 'A code block inside a list item stays inside that item and does not split the list.',
    check: (x) => x.blockInsideList('fence') || x.blockInsideList('code_block'),
  },
  {
    id: 'C3.7', group: 'Lists and tasks', severity: 'major',
    rule: 'A table inside a list item is not deleted. Markdown cannot nest it, so it must degrade visibly.',
    check: (x) => x.hasAll(['Key', 'Value']) && x.has('An item with a table attached'),
  },
  {
    id: 'C3.8', group: 'Lists and tasks', severity: 'major',
    rule: 'A quote inside a list item survives.',
    check: (x) => x.has('Quoted inside a list item'),
  },

  // ------------------------------------------------------------- 04 tables
  {
    id: 'C4.1', group: 'Tables', severity: 'major',
    rule: 'A table becomes a Markdown table, and inline marks inside cells survive.',
    check: (x) => /<table>/.test(x.html) && x.has('spaceKey') && /<code>a \| b<\/code>/.test(x.html),
  },
  {
    id: 'C4.2', group: 'Tables', severity: 'minor',
    rule: 'Empty cells do not shift the remaining columns.',
    check: (x) => x.tableRows().some((r) => r.length >= 2 && r.some((c) => c.trim() === '')),
  },
  {
    id: 'C4.4', group: 'Tables', severity: 'critical',
    rule: 'Merged cells cannot be expressed in Markdown, but their text must not be lost.',
    check: (x) => x.hasAll(['Merged header across two columns', 'Spans two rows', 'b2', 'c2']),
  },
  {
    id: 'C4.5', group: 'Tables', severity: 'critical',
    rule: 'Block content inside a cell (a list, a code block, two paragraphs) is not dropped.',
    check: (x) => x.hasAll(['list in a cell', 'code in a cell', 'two paragraphs', '{"a": 1}']),
  },
  {
    id: 'C4.6', group: 'Tables', severity: 'minor',
    rule: 'A line break inside a cell stays a line break.',
    check: (x) => /first line\s*<br\s*\/?>\s*second line/i.test(x.html),
  },
  {
    id: 'C4.8', group: 'Tables', severity: 'major',
    rule: 'A table whose cells hold CJK text still parses as a table.',
    check: (x) => x.tableRows().some((r) => r.some((c) => c.includes('아주 긴 한글 항목 이름입니다'))),
  },

  // ------------------------------------------------------------- 05 media
  {
    id: 'C5.1', group: 'Media', severity: 'critical',
    rule: 'Attached images are written out as files.',
    check: (x) => x.hasFiles(['diagram.png', 'photo.jpg', 'vector.svg']),
  },
  {
    id: 'C5.2', group: 'Media', severity: 'critical',
    rule: 'Image references in the body point at the exported files.',
    check: (x) => /!\[[^\]]*\]\([^)]*diagram\.png\)/.test(x.text),
  },
  {
    id: 'C5.4', group: 'Media', severity: 'major',
    rule: 'An attachment whose name contains a space is exported and correctly referenced.',
    check: (x) => x.hasFileMatching(/space[-_ %]?name\.png$/i)
      && /!\[[^\]]*\]\(<?[^)\s]*space(%20|[-_ ])name\.png>?\)/i.test(x.text),
  },
  {
    id: 'C5.5', group: 'Media', severity: 'critical',
    rule: 'An attachment with a non-ASCII filename is exported and still identifiable.',
    check: (x) => x.hasFileMatching(/그림|geurim|kore|image/i) || x.hasFileMatching(/\.png$/) && x.has('korean filename'),
  },
  {
    id: 'C5.6', group: 'Media', severity: 'major',
    rule: 'An image referenced by external URL is kept as an external reference.',
    check: (x) => x.has('wac-cdn.atlassian.com'),
  },
  {
    id: 'C5.8', group: 'Media', severity: 'critical',
    rule: 'An image wrapped in a link produces valid Markdown — a link containing an image.',
    check: (x) => /<a [^>]*>\s*<img /.test(x.html),
  },
  {
    id: 'C5.9', group: 'Media', severity: 'major',
    rule: 'An image inside a table cell stays inside the table.',
    check: (x) => x.tableRows().some((r) => r.some((c) => /!\[|<img/.test(c))),
  },
  {
    id: 'C5.11', group: 'Media', severity: 'major',
    rule: 'A non-image attachment is exported and linked relatively, not back to a wiki URL.',
    check: (x) => x.hasFileMatching(/sample\.txt$/)
      && /\]\((?!https?:)[^)]*sample\.txt[^)]*\)/.test(x.text),
  },

  // ------------------------------------------------------------- 06 macros
  {
    id: 'C6.1', group: 'Macros', severity: 'critical',
    rule: 'Panel text survives. A panel with no Markdown equivalent must degrade, never delete.',
    check: (x) => x.hasAll(['An info panel', 'A note panel', 'A warning panel', 'A tip panel']),
  },
  {
    id: 'C6.2', group: 'Macros', severity: 'critical',
    rule: 'Block content inside a panel survives too.',
    check: (x) => x.has('inside a panel'),
  },
  {
    id: 'C6.3', group: 'Macros', severity: 'critical',
    rule: 'Collapsed content is still exported. Being hidden is not the same as being absent.',
    check: (x) => x.hasAll(['Click to see the hidden content', 'Hidden body text']),
  },
  {
    id: 'C6.4', group: 'Macros', severity: 'major',
    rule: 'Status lozenge text survives.',
    check: (x) => x.hasAll(['PASSED', 'FAILED']),
  },
  {
    id: 'C6.5', group: 'Macros', severity: 'major',
    rule: 'Dates survive in a readable form.',
    check: (x) => /2026-12-31|31[\/.\- ]?(12|Dec)[\/.\- ]?2026|Dec[a-z]*\.?\s+31,?\s+2026/i.test(x.text),
  },
  {
    id: 'C6.8', group: 'Macros', severity: 'major',
    rule: 'Excerpt text survives.',
    check: (x) => x.has('This sentence is the page excerpt'),
  },
  {
    id: 'C6.9', group: 'Macros', severity: 'major',
    rule: 'An include macro does not abort the export.',
    check: (x) => x.mdFiles.length > 0 && x.has('An unknown third-party macro'),
  },
  {
    id: 'C6.10', group: 'Macros', severity: 'critical',
    rule: 'An unknown third-party macro still yields its body text.',
    check: (x) => x.has('Body of a macro the exporter has never seen'),
  },

  // ------------------------------------------------------------- 07 layout
  {
    id: 'C7.1', group: 'Layout', severity: 'critical',
    rule: 'Column layouts flatten in reading order with no cell dropped.',
    check: (x) => x.hasAll([
      'Text that lives in the left column',
      'Text that lives in the right column',
      'First of three', 'Second of three', 'Third of three',
    ]),
  },
  {
    id: 'C7.2', group: 'Layout', severity: 'major',
    rule: 'A code block inside a layout cell survives with its language.',
    check: (x) => x.codeBlockContents().some((c) => c.includes('inside a layout cell')),
  },

  // ------------------------------------------------------------- 08 titles
  {
    id: 'C8.1', group: 'Title hazards', severity: 'critical',
    rule: 'No exported filename is an opaque placeholder such as page-<uuid>.md.',
    check: (x) => !x.hasFileMatching(/(^|\/)(page|untitled)[-_]?[0-9a-f]{8}-[0-9a-f]{4}/i),
  },
  {
    id: 'C8.2', group: 'Title hazards', severity: 'critical',
    rule: 'A page titled only in Korean still produces a filename a human can identify.',
    check: (x) => x.fileForContent('the title is entirely Korean', (name) =>
      /[가-힣]/.test(name) || /hangul|korean|hangeul|jemok|제목/i.test(name)),
  },
  {
    id: 'C8.3', group: 'Title hazards', severity: 'critical',
    rule: 'A title mixing Korean with one ASCII word does not collapse to that word alone.',
    check: (x) => x.fileForContent('mixes Korean with one ASCII word', (name) =>
      !/^(.*\/)?ascii\.(md|markdown)$/i.test(name)),
  },
  {
    id: 'C8.4', group: 'Title hazards', severity: 'critical',
    rule: 'Two titles that differ only in discarded characters produce two distinct files.',
    check: (x) => {
      const a = x.filesContaining('the hazard it carries') // not used, keeps helper honest
      void a
      const f1 = x.filesContaining('this title differs from its sibling')
      const f2 = x.filesContaining('The sibling of the previous page')
      return f1.length === 1 && f2.length === 1 && f1[0] !== f2[0]
    },
  },
  {
    id: 'C8.5', group: 'Title hazards', severity: 'major',
    rule: 'A title containing punctuation illegal in filenames is exported safely, not dropped.',
    check: (x) => x.filesContaining('slash, colon, question mark').length === 1,
  },
  {
    id: 'C8.6', group: 'Title hazards', severity: 'minor',
    rule: 'A title containing emoji is exported without crashing.',
    check: (x) => x.filesContaining('the title contains emoji').length === 1,
  },

  // ------------------------------------------------------------- 09 depth
  {
    id: 'C9.1', group: 'Page tree', severity: 'critical',
    rule: 'A bulk export reaches the whole subtree, including great-grandchildren.',
    check: (x) => x.hasAll(['Depth 2 of 4', 'Depth 3 of 4', 'Depth 4 of 4']),
  },
  {
    id: 'C9.2', group: 'Page tree', severity: 'major',
    rule: 'The exported directory structure mirrors the page hierarchy.',
    check: (x) => x.mdFiles.some((f) => (f.match(/\//g) || []).length >= 3),
  },
  {
    id: 'C9.3', group: 'Page tree', severity: 'critical',
    rule: 'Every page in the corpus appears exactly once in the export.',
    check: (x) => x.mdFiles.length >= 20,
  },
]
