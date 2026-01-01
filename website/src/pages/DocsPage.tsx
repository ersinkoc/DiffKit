import { Routes, Route, Link, useLocation } from 'react-router-dom';

const sections = [
  { path: '', title: 'Getting Started' },
  { path: 'algorithms', title: 'Algorithms' },
  { path: 'view-modes', title: 'View Modes' },
  { path: 'word-diff', title: 'Word-Level Diff' },
  { path: 'semantic', title: 'Semantic Diff' },
  { path: 'plugins', title: 'Plugins' },
  { path: 'themes', title: 'Themes' },
  { path: 'react', title: 'React Components' },
  { path: 'api', title: 'API Reference' },
];

function DocsPage() {
  const location = useLocation();
  const currentPath = location.pathname.replace('/docs', '').replace(/^\//, '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-8">
        {/* Sidebar */}
        <nav className="w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Documentation
            </h2>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.path}>
                  <Link
                    to={`/docs/${section.path}`}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      currentPath === section.path
                        ? 'bg-brand-50 text-brand-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {section.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Routes>
            <Route index element={<GettingStarted />} />
            <Route path="algorithms" element={<Algorithms />} />
            <Route path="view-modes" element={<ViewModes />} />
            <Route path="word-diff" element={<WordDiff />} />
            <Route path="semantic" element={<SemanticDiff />} />
            <Route path="plugins" element={<Plugins />} />
            <Route path="themes" element={<Themes />} />
            <Route path="react" element={<ReactDocs />} />
            <Route path="api" element={<APIReference />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      {children}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4">
      <code>{code}</code>
    </pre>
  );
}

function GettingStarted() {
  return (
    <DocSection title="Getting Started">
      <h2 className="text-2xl font-semibold mt-8 mb-4">Installation</h2>
      <CodeBlock code="npm install @oxog/diffkit" />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Quick Start</h2>
      <p className="text-gray-600 mb-4">
        The simplest way to create a diff is using the <code>createDiff</code> function:
      </p>
      <CodeBlock code={`import { createDiff } from '@oxog/diffkit';

const diff = createDiff(
  'Hello World',
  'Hello DiffKit'
);

// Get statistics
console.log(diff.stats);
// { additions: 1, deletions: 1, changes: 2, similarity: 0.5 }

// Get unified diff string
console.log(diff.toUnifiedString());

// Get HTML output
console.log(diff.toHTML());`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Using DiffEngine</h2>
      <p className="text-gray-600 mb-4">
        For more control, use the <code>DiffEngine</code> class:
      </p>
      <CodeBlock code={`import { DiffEngine, syntaxPlugin } from '@oxog/diffkit';

const engine = new DiffEngine({
  algorithm: 'patience',
  granularity: 'line',
  context: 3,
});

// Add syntax highlighting
engine.use(syntaxPlugin({ language: 'javascript' }));

const result = engine.diff(oldCode, newCode);`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Options</h2>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li><code>algorithm</code>: <code>'myers'</code> | <code>'patience'</code> | <code>'histogram'</code> (default: <code>'myers'</code>)</li>
        <li><code>granularity</code>: <code>'line'</code> | <code>'word'</code> | <code>'char'</code> (default: <code>'line'</code>)</li>
        <li><code>context</code>: Number of context lines (default: 3)</li>
        <li><code>ignoreCase</code>: Ignore case differences (default: false)</li>
        <li><code>ignoreWhitespace</code>: Ignore whitespace differences (default: false)</li>
      </ul>
    </DocSection>
  );
}

function Algorithms() {
  return (
    <DocSection title="Algorithms">
      <p className="text-gray-600 mb-8">
        DiffKit provides three diff algorithms, each optimized for different use cases.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Myers Algorithm</h2>
      <p className="text-gray-600 mb-4">
        The default algorithm. Classic O(ND) diff algorithm that produces minimal edit scripts.
        Best for general-purpose text diffing.
      </p>
      <CodeBlock code={`createDiff(old, new, { algorithm: 'myers' });`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Patience Algorithm</h2>
      <p className="text-gray-600 mb-4">
        Uses unique lines as anchors for better readability. Produces more human-friendly diffs,
        especially for code. Used by Git for the "patience diff" option.
      </p>
      <CodeBlock code={`createDiff(old, new, { algorithm: 'patience' });`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Histogram Algorithm</h2>
      <p className="text-gray-600 mb-4">
        Optimized for large files with many repeated lines. Based on line occurrence histograms
        to find the best matching regions.
      </p>
      <CodeBlock code={`createDiff(old, new, { algorithm: 'histogram' });`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">When to Use Each</h2>
      <table className="w-full border-collapse mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-200 px-4 py-2 text-left">Algorithm</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Best For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-200 px-4 py-2">Myers</td>
            <td className="border border-gray-200 px-4 py-2">General text, small to medium files</td>
          </tr>
          <tr>
            <td className="border border-gray-200 px-4 py-2">Patience</td>
            <td className="border border-gray-200 px-4 py-2">Source code, structured content</td>
          </tr>
          <tr>
            <td className="border border-gray-200 px-4 py-2">Histogram</td>
            <td className="border border-gray-200 px-4 py-2">Large files, files with repetition</td>
          </tr>
        </tbody>
      </table>
    </DocSection>
  );
}

function ViewModes() {
  return (
    <DocSection title="View Modes">
      <p className="text-gray-600 mb-8">
        DiffKit supports three view modes for displaying diffs, plus virtual scrolling for large files.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Unified View</h2>
      <p className="text-gray-600 mb-4">
        Single column with +/- prefixes. The most common format, used by git diff.
      </p>
      <CodeBlock code={`import { HTMLRenderer } from '@oxog/diffkit';

const renderer = new HTMLRenderer({ mode: 'unified' });
const html = renderer.render(diff);`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Split View</h2>
      <p className="text-gray-600 mb-4">
        Two columns side-by-side. Old content on the left, new content on the right.
        Great for code review.
      </p>
      <CodeBlock code={`const renderer = new HTMLRenderer({ mode: 'split' });
const html = renderer.render(diff);`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Inline View</h2>
      <p className="text-gray-600 mb-4">
        Changes highlighted inline within the text. Best for prose or when space is limited.
      </p>
      <CodeBlock code={`const renderer = new HTMLRenderer({ mode: 'inline' });
const html = renderer.render(diff);`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Virtual Scrolling (React)</h2>
      <p className="text-gray-600 mb-4">
        For large diffs, use virtualized components that only render visible lines for better performance.
      </p>
      <CodeBlock code={`import { VirtualizedUnifiedView } from '@oxog/diffkit/react';

<VirtualizedUnifiedView
  old={oldContent}
  new={newContent}
  containerHeight={600}
  lineHeight={22}
  virtualize="auto"  // 'auto' | 'always' | 'never'
  virtualizeThreshold={500}
/>`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Renderer Options</h2>
      <CodeBlock code={`const renderer = new HTMLRenderer({
  mode: 'unified',
  theme: 'github-dark',
  lineNumbers: true,
  wrapLines: false,
});`} />
    </DocSection>
  );
}

function WordDiff() {
  return (
    <DocSection title="Word-Level Diff">
      <p className="text-gray-600 mb-8">
        DiffKit provides word and character-level diffing to highlight exactly what changed within modified lines.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Basic Usage</h2>
      <CodeBlock code={`import { diffWords } from '@oxog/diffkit';

const result = diffWords(
  'Hello world',
  'Hello there'
);

// result.oldSegments: [{ text: 'Hello ', type: 'equal' }, { text: 'world', type: 'delete' }]
// result.newSegments: [{ text: 'Hello ', type: 'equal' }, { text: 'there', type: 'insert' }]
// result.hasDifferences: true`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Character-Level Diff</h2>
      <p className="text-gray-600 mb-4">
        For finer granularity, use character-level diffing:
      </p>
      <CodeBlock code={`const result = diffWords('cat', 'bat', {
  granularity: 'char'
});

// Detects: 'c' -> 'b' change`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Enhance Line Diffs</h2>
      <p className="text-gray-600 mb-4">
        Automatically pair and enhance delete/add line pairs with word-level segments:
      </p>
      <CodeBlock code={`import { enhanceChangesWithWordDiff } from '@oxog/diffkit';

const changes = [
  { type: 'delete', content: 'const x = 1;', oldLineNumber: 1 },
  { type: 'add', content: 'const x = 2;', newLineNumber: 1 },
];

const enhanced = enhanceChangesWithWordDiff(changes);
// enhanced[0].segments shows word-level diff for delete line
// enhanced[1].segments shows word-level diff for add line
// enhanced[0].hasPairedChange = true`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Render to HTML</h2>
      <CodeBlock code={`import { segmentsToHtml } from '@oxog/diffkit';

const html = segmentsToHtml(result.newSegments, {
  deleteClass: 'my-delete-class',
  insertClass: 'my-insert-class',
  equalClass: 'my-equal-class',
});`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Options</h2>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li><code>granularity</code>: <code>'word'</code> | <code>'char'</code> (default: <code>'word'</code>)</li>
        <li><code>ignoreWhitespace</code>: Ignore whitespace differences</li>
        <li><code>ignoreCase</code>: Case-insensitive comparison</li>
      </ul>
    </DocSection>
  );
}

function SemanticDiff() {
  return (
    <DocSection title="Semantic Diff">
      <p className="text-gray-600 mb-8">
        DiffKit provides structure-aware diffing for JSON and YAML, reporting changes by path.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">JSON Diff</h2>
      <CodeBlock code={`import { diffJson } from '@oxog/diffkit';

const result = diffJson(
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 30, city: 'NYC' }
);

// result.isEqual: false
// result.changes: [
//   { type: 'modify', path: 'name', oldValue: 'Alice', newValue: 'Bob' },
//   { type: 'add', path: 'city', newValue: 'NYC' }
// ]
// result.stats: { additions: 1, deletions: 0, modifications: 1 }`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">JSON String Diff</h2>
      <CodeBlock code={`import { diffJsonStrings } from '@oxog/diffkit';

const result = diffJsonStrings(
  '{"name": "test"}',
  '{"name": "updated"}'
);`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">YAML Diff</h2>
      <CodeBlock code={`import { diffYaml } from '@oxog/diffkit';

const result = diffYaml(\`
name: test
version: 1.0.0
\`, \`
name: test
version: 2.0.0
\`);

// result.changes[0].path: 'version'`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Options</h2>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li><code>maxDepth</code>: Maximum depth to traverse (default: unlimited)</li>
        <li><code>ignorePaths</code>: Array of paths to ignore (e.g., <code>['timestamp', 'id']</code>)</li>
        <li><code>ignoreArrayOrder</code>: Treat arrays as sets</li>
        <li><code>detectMoves</code>: Detect moved items in arrays</li>
        <li><code>nullEqualsUndefined</code>: Treat null and undefined as equal</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Format Changes</h2>
      <CodeBlock code={`import { formatJsonChanges, formatYamlChanges } from '@oxog/diffkit';

const readable = formatJsonChanges(result);
// Output:
// ~ name: Alice → Bob
// + city: NYC`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Change Types</h2>
      <table className="w-full border-collapse mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-200 px-4 py-2 text-left">Type</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-200 px-4 py-2"><code>add</code></td>
            <td className="border border-gray-200 px-4 py-2">New property added</td>
          </tr>
          <tr>
            <td className="border border-gray-200 px-4 py-2"><code>delete</code></td>
            <td className="border border-gray-200 px-4 py-2">Property removed</td>
          </tr>
          <tr>
            <td className="border border-gray-200 px-4 py-2"><code>modify</code></td>
            <td className="border border-gray-200 px-4 py-2">Value changed</td>
          </tr>
          <tr>
            <td className="border border-gray-200 px-4 py-2"><code>type-change</code></td>
            <td className="border border-gray-200 px-4 py-2">Type changed (e.g., number to string)</td>
          </tr>
          <tr>
            <td className="border border-gray-200 px-4 py-2"><code>move</code></td>
            <td className="border border-gray-200 px-4 py-2">Item moved in array (when detectMoves enabled)</td>
          </tr>
        </tbody>
      </table>
    </DocSection>
  );
}

function Plugins() {
  return (
    <DocSection title="Plugins">
      <p className="text-gray-600 mb-8">
        Extend DiffKit with plugins for specialized diffing.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Syntax Plugin</h2>
      <p className="text-gray-600 mb-4">
        Adds syntax highlighting for supported languages.
      </p>
      <CodeBlock code={`import { syntaxPlugin } from '@oxog/diffkit';

engine.use(syntaxPlugin({
  language: 'typescript',
  highlightChanges: true,
}));`} />
      <p className="text-gray-600 mb-4">
        <strong>Supported languages:</strong> javascript, typescript, python, go, rust, java, cpp, css, html, json, markdown, sql
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">HTML DOM Plugin</h2>
      <p className="text-gray-600 mb-4">
        Structure-aware HTML diffing that understands DOM structure.
      </p>
      <CodeBlock code={`import { htmlDomPlugin } from '@oxog/diffkit';

engine.use(htmlDomPlugin({
  ignoreComments: true,
  normalizeWhitespace: true,
}));`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">HTML Text Plugin</h2>
      <p className="text-gray-600 mb-4">
        Text-based HTML diffing with tag stripping.
      </p>
      <CodeBlock code={`import { htmlTextPlugin } from '@oxog/diffkit';

engine.use(htmlTextPlugin({
  stripTags: true,
  decodeEntities: true,
}));`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Markdown Plugin</h2>
      <p className="text-gray-600 mb-4">
        Markdown-aware diffing that preserves structure.
      </p>
      <CodeBlock code={`import { markdownPlugin } from '@oxog/diffkit';

engine.use(markdownPlugin({
  preserveStructure: true,
}));`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Plugin Lifecycle</h2>
      <p className="text-gray-600 mb-4">
        Plugins can hook into various lifecycle events:
      </p>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li><code>onInit</code>: Called when plugin is registered</li>
        <li><code>onBeforeDiff</code>: Transform content before diffing</li>
        <li><code>onAfterDiff</code>: Transform result after diffing</li>
        <li><code>onBeforeRender</code>: Transform before rendering</li>
        <li><code>onAfterRender</code>: Transform after rendering</li>
      </ul>
    </DocSection>
  );
}

function Themes() {
  return (
    <DocSection title="Themes">
      <p className="text-gray-600 mb-8">
        DiffKit includes a complete theming system with pre-built themes and custom theme support.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Built-in Themes</h2>
      <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
        <li><code>github-dark</code> (default)</li>
        <li><code>github-light</code></li>
        <li><code>vscode-dark</code></li>
        <li><code>vscode-light</code></li>
        <li><code>monokai</code></li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Using Themes</h2>
      <CodeBlock code={`import { HTMLRenderer, getTheme } from '@oxog/diffkit';

const renderer = new HTMLRenderer({
  theme: 'github-dark',
});

// Or get a theme object
const theme = getTheme('vscode-dark');`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Creating Custom Themes</h2>
      <CodeBlock code={`import { createTheme } from '@oxog/diffkit';

const customTheme = createTheme({
  name: 'my-theme',
  extends: 'github-dark',
  colors: {
    background: '#1a1a1a',
    addedBackground: '#1a3d1a',
    deletedBackground: '#3d1a1a',
    syntax: {
      keyword: '#ff79c6',
      string: '#f1fa8c',
    },
  },
});`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">CSS Variables</h2>
      <CodeBlock code={`import { generateCSSVars, cssVarsToString } from '@oxog/diffkit';

const vars = generateCSSVars(theme);
const styleString = cssVarsToString(vars);

// Apply to element
element.style.cssText = styleString;`} />
    </DocSection>
  );
}

function ReactDocs() {
  return (
    <DocSection title="React Components">
      <p className="text-gray-600 mb-8">
        DiffKit provides ready-to-use React components with hooks, keyboard navigation, and accessibility support.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">DiffView Component</h2>
      <CodeBlock code={`import { DiffView } from '@oxog/diffkit/react';

function App() {
  return (
    <DiffView
      old={oldContent}
      new={newContent}
      mode="split"
      lineNumbers
      algorithm="patience"
      theme="github-dark"
    />
  );
}`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Virtualized View</h2>
      <p className="text-gray-600 mb-4">
        For large diffs with thousands of lines, use virtualized components for smooth scrolling:
      </p>
      <CodeBlock code={`import { VirtualizedUnifiedView } from '@oxog/diffkit/react';

<VirtualizedUnifiedView
  old={oldContent}
  new={newContent}
  containerHeight={600}
  lineHeight={22}
  virtualize="auto"
/>`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">ThemeProvider</h2>
      <CodeBlock code={`import { ThemeProvider, DiffView } from '@oxog/diffkit/react';

function App() {
  return (
    <ThemeProvider theme="github-dark">
      <DiffView old={old} new={new} />
    </ThemeProvider>
  );
}`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Hooks</h2>

      <h3 className="text-xl font-semibold mt-6 mb-3">useDiff</h3>
      <CodeBlock code={`import { useDiff } from '@oxog/diffkit/react';

function MyComponent({ old, new: newContent }) {
  const { result, loading, error } = useDiff(old, newContent, {
    algorithm: 'myers',
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <pre>{JSON.stringify(result.stats, null, 2)}</pre>;
}`} />

      <h3 className="text-xl font-semibold mt-6 mb-3">useKeyboardNavigation</h3>
      <p className="text-gray-600 mb-4">
        Add keyboard navigation with vim-style keys (j/k, n/p) and arrow keys:
      </p>
      <CodeBlock code={`import { useKeyboardNavigation } from '@oxog/diffkit/react';

function DiffWithKeyboard({ lines }) {
  const { currentIndex, handlers, getItemProps } = useKeyboardNavigation(
    lines.length,
    {
      wrap: true,
      onSelect: (index) => console.log('Selected line:', index),
    }
  );

  return (
    <div {...handlers}>
      {lines.map((line, i) => (
        <div
          key={i}
          {...getItemProps(i)}
          className={i === currentIndex ? 'selected' : ''}
        >
          {line}
        </div>
      ))}
    </div>
  );
}`} />

      <h3 className="text-xl font-semibold mt-6 mb-3">useCollapsible</h3>
      <p className="text-gray-600 mb-4">
        Manage collapsible hunks with auto-collapse for large sections:
      </p>
      <CodeBlock code={`import { useCollapsible } from '@oxog/diffkit/react';

function CollapsibleDiff({ hunks }) {
  const {
    isCollapsed,
    toggle,
    expandAll,
    collapseAll,
    collapsedCount,
  } = useCollapsible(hunks, {
    defaultState: 'auto',
    autoCollapseThreshold: 50,
  });

  return (
    <div>
      <button onClick={expandAll}>Expand All</button>
      <button onClick={collapseAll}>Collapse All</button>
      {hunks.map((hunk, i) => (
        <div key={i}>
          <button onClick={() => toggle(i)}>
            {isCollapsed(i) ? 'Expand' : 'Collapse'}
          </button>
          {!isCollapsed(i) && <HunkContent hunk={hunk} />}
        </div>
      ))}
    </div>
  );
}`} />

      <h3 className="text-xl font-semibold mt-6 mb-3">useCopyToClipboard</h3>
      <p className="text-gray-600 mb-4">
        Copy diff content with various formatting options:
      </p>
      <CodeBlock code={`import { useCopyToClipboard } from '@oxog/diffkit/react';

function CopyableDiff({ hunks }) {
  const {
    status,
    copyHunk,
    copyAllHunks,
    copyAdditions,
    copyDeletions,
    copyAsUnifiedDiff,
  } = useCopyToClipboard();

  return (
    <div>
      <button onClick={() => copyAllHunks(hunks)}>
        {status === 'success' ? 'Copied!' : 'Copy All'}
      </button>
      <button onClick={() => copyAdditions(hunks)}>
        Copy Additions Only
      </button>
      <button onClick={() => copyAsUnifiedDiff(hunks)}>
        Copy as Unified Diff
      </button>
    </div>
  );
}`} />

      <h3 className="text-xl font-semibold mt-6 mb-3">useTheme</h3>
      <CodeBlock code={`import { useTheme } from '@oxog/diffkit/react';

function ThemedComponent() {
  const { theme, setTheme, cssVars } = useTheme();

  return (
    <div style={cssVars}>
      Current theme: {theme.name}
      <button onClick={() => setTheme('monokai')}>
        Switch to Monokai
      </button>
    </div>
  );
}`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Accessibility</h2>
      <p className="text-gray-600 mb-4">
        All components include ARIA attributes for screen reader support:
      </p>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>Keyboard navigation with focus management</li>
        <li>ARIA labels for interactive elements</li>
        <li>Proper heading hierarchy</li>
        <li>Screen reader announcements for state changes</li>
      </ul>
    </DocSection>
  );
}

function APIReference() {
  return (
    <DocSection title="API Reference">
      <h2 className="text-2xl font-semibold mt-8 mb-4">createDiff(old, new, options?)</h2>
      <p className="text-gray-600 mb-4">Creates a diff result between two strings.</p>
      <CodeBlock code={`createDiff(old: string, new: string, options?: DiffOptions): DiffResult`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">DiffEngine</h2>
      <CodeBlock code={`class DiffEngine {
  constructor(options?: DiffEngineOptions)
  use(plugin: DiffPlugin): this
  setAlgorithm(algorithm: AlgorithmType): this
  setGranularity(granularity: GranularityType): this
  setTheme(theme: string | Theme): this
  diff(old: string, new: string): DiffResult
  getPlugins(): DiffPlugin[]
}`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">DiffResult</h2>
      <CodeBlock code={`interface DiffResult {
  oldContent: string
  newContent: string
  hunks: Hunk[]
  stats: DiffStats
  options: DiffOptions
  toJSON(): DiffJSON
  toUnifiedString(): string
  toHTML(options?: HTMLRendererOptions): string
}`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">HTMLRenderer</h2>
      <CodeBlock code={`class HTMLRenderer {
  constructor(options?: HTMLRendererOptions)
  setMode(mode: ViewMode): void
  setTheme(theme: Theme | string): void
  render(result: DiffResult): string
  renderWithWordDiff(result: DiffResult): string
}`} />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Theme Functions</h2>
      <CodeBlock code={`createTheme(options: CreateThemeOptions): Theme
validateTheme(theme: unknown): theme is Theme
cloneTheme(theme: Theme, newName: string): Theme
generateCSSVars(theme: Theme): Record<string, string>
cssVarsToString(vars: Record<string, string>): string
getTheme(name: string): Theme | undefined
listThemes(): string[]`} />
    </DocSection>
  );
}

export default DocsPage;
