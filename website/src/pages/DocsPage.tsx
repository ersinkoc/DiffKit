import { Routes, Route, Link, useLocation } from 'react-router-dom';

const sections = [
  { path: '', title: 'Getting Started' },
  { path: 'algorithms', title: 'Algorithms' },
  { path: 'view-modes', title: 'View Modes' },
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
        DiffKit supports three view modes for displaying diffs.
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
        <strong>Supported languages:</strong> javascript, typescript, python, css, html, json, markdown
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
        DiffKit provides ready-to-use React components for easy integration.
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
