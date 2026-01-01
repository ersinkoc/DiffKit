import { useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';

const examples = [
  { id: 'basic', title: 'Basic Usage', description: 'Simple text comparison' },
  { id: 'code', title: 'Code Diff', description: 'Compare source code with syntax highlighting' },
  { id: 'algorithms', title: 'Algorithm Comparison', description: 'Compare Myers, Patience, and Histogram algorithms' },
  { id: 'views', title: 'View Modes', description: 'Unified, Split, and Inline views' },
  { id: 'themes', title: 'Theme Showcase', description: 'All built-in themes' },
  { id: 'plugins', title: 'Plugins', description: 'Using syntax highlighting and HTML plugins' },
  { id: 'react', title: 'React Components', description: 'Using React components and hooks' },
  { id: 'custom-theme', title: 'Custom Themes', description: 'Creating custom themes' },
];

function ExampleSidebar() {
  const location = useLocation();
  const currentPath = location.pathname.replace('/examples/', '').replace('/examples', '') || 'basic';

  return (
    <nav className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Examples</h2>
        <ul className="space-y-1">
          {examples.map((example) => (
            <li key={example.id}>
              <Link
                to={`/examples/${example.id}`}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPath === example.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                {example.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function BasicExample() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Basic Usage</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Learn how to perform a simple text comparison using DiffKit.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Simple Text Diff</h2>
        <CodeBlock code={`import { diff, renderUnified } from '@oxog/diffkit';

const oldText = \`Hello World
This is a test
Goodbye\`;

const newText = \`Hello World
This is an example
Goodbye World\`;

// Generate diff
const result = diff(oldText, newText);

// Render as HTML
const html = renderUnified(result);

// Use the HTML in your application
document.getElementById('diff-output').innerHTML = html;`} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">With Options</h2>
        <CodeBlock code={`import { diff, renderUnified } from '@oxog/diffkit';

const result = diff(oldText, newText, {
  algorithm: 'patience',  // Better for code
  granularity: 'word',    // Word-level changes
  ignoreWhitespace: true, // Ignore whitespace differences
});

const html = renderUnified(result, {
  lineNumbers: true,
  highlightChanges: true,
});`} />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Pro Tip</h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          For best results with source code, use the <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">patience</code> algorithm
          and <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">line</code> granularity.
        </p>
      </div>
    </div>
  );
}

function CodeExample() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Code Diff</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare source code with syntax highlighting for better readability.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">JavaScript/TypeScript</h2>
        <CodeBlock code={`import { diff, renderSplit, SyntaxHighlightPlugin } from '@oxog/diffkit';

const oldCode = \`function greet(name) {
  console.log("Hello, " + name);
}\`;

const newCode = \`function greet(name: string): void {
  console.log(\\\`Hello, \\\${name}!\\\`);
}\`;

const result = diff(oldCode, newCode, {
  algorithm: 'patience',
  plugins: [new SyntaxHighlightPlugin({ language: 'typescript' })],
});

const html = renderSplit(result, {
  lineNumbers: true,
});`} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Python</h2>
        <CodeBlock code={`import { diff, renderUnified, SyntaxHighlightPlugin } from '@oxog/diffkit';

const oldPython = \`def calculate(x, y):
    return x + y\`;

const newPython = \`def calculate(x: int, y: int) -> int:
    """Add two numbers together."""
    return x + y\`;

const result = diff(oldPython, newPython, {
  plugins: [new SyntaxHighlightPlugin({ language: 'python' })],
});`} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Supported Languages</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['JavaScript', 'TypeScript', 'Python', 'CSS', 'HTML', 'JSON', 'Markdown', 'Plain Text'].map((lang) => (
            <div key={lang} className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm text-center">
              {lang}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlgorithmsExample() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Algorithm Comparison</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare the three diff algorithms to understand when to use each one.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Myers</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            The classic O(ND) algorithm. Best for general text and small files.
          </p>
          <CodeBlock code={`diff(old, new, {
  algorithm: 'myers'
})`} />
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Patience</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Better for source code. Produces more readable diffs.
          </p>
          <CodeBlock code={`diff(old, new, {
  algorithm: 'patience'
})`} />
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Histogram</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Optimized for large files. Uses frequency analysis.
          </p>
          <CodeBlock code={`diff(old, new, {
  algorithm: 'histogram'
})`} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-4">Algorithm</th>
                <th className="text-left py-2 px-4">Best For</th>
                <th className="text-left py-2 px-4">Complexity</th>
                <th className="text-left py-2 px-4">Memory</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-400">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 px-4 font-medium text-gray-900 dark:text-white">Myers</td>
                <td className="py-2 px-4">General text</td>
                <td className="py-2 px-4">O(ND)</td>
                <td className="py-2 px-4">Medium</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 px-4 font-medium text-gray-900 dark:text-white">Patience</td>
                <td className="py-2 px-4">Source code</td>
                <td className="py-2 px-4">O(N log N)</td>
                <td className="py-2 px-4">Low</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-medium text-gray-900 dark:text-white">Histogram</td>
                <td className="py-2 px-4">Large files</td>
                <td className="py-2 px-4">O(N)</td>
                <td className="py-2 px-4">Higher</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ViewsExample() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">View Modes</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose the best view mode for your use case.
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Unified View</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Single column with +/- prefixes. Best for reviewing sequential changes.
          </p>
          <CodeBlock code={`import { diff, renderUnified } from '@oxog/diffkit';

const result = diff(oldText, newText);
const html = renderUnified(result, {
  lineNumbers: true,
  highlightChanges: true,
});`} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Split View</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Two columns side-by-side. Best for comparing files visually.
          </p>
          <CodeBlock code={`import { diff, renderSplit } from '@oxog/diffkit';

const result = diff(oldText, newText);
const html = renderSplit(result, {
  lineNumbers: true,
  highlightChanges: true,
  syncScroll: true,  // Keep columns in sync
});`} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inline View</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Changes highlighted inline within the text. Best for small changes.
          </p>
          <CodeBlock code={`import { diff, renderInline } from '@oxog/diffkit';

const result = diff(oldText, newText, {
  granularity: 'character',  // Best with character granularity
});
const html = renderInline(result);`} />
        </div>
      </div>
    </div>
  );
}

function ThemesExample() {
  const themes = ['github-dark', 'github-light', 'vscode-dark', 'vscode-light', 'monokai'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Theme Showcase</h1>
        <p className="text-gray-600 dark:text-gray-400">
          DiffKit includes five built-in themes to match your application's style.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div key={theme} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 capitalize">
              {theme.replace('-', ' ')}
            </h3>
            <CodeBlock code={`import { getTheme } from '@oxog/diffkit';

const theme = getTheme('${theme}');`} />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Using Themes</h2>
        <CodeBlock code={`import { diff, renderUnified, getTheme, generateCSSVariables } from '@oxog/diffkit';

// Get a built-in theme
const theme = getTheme('github-dark');

// Generate CSS variables
const cssVars = generateCSSVariables(theme);

// Inject into your page
const style = document.createElement('style');
style.textContent = \`:root { \${cssVars} }\`;
document.head.appendChild(style);

// Render with theme
const html = renderUnified(result, { theme });`} />
      </div>
    </div>
  );
}

function PluginsExample() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Using Plugins</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Extend DiffKit's functionality with built-in and custom plugins.
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Syntax Highlighting</h2>
          <CodeBlock code={`import { diff, SyntaxHighlightPlugin } from '@oxog/diffkit';

const result = diff(oldCode, newCode, {
  plugins: [
    new SyntaxHighlightPlugin({
      language: 'typescript',
      theme: 'github-dark',
    }),
  ],
});`} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">HTML DOM Plugin</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Structure-aware HTML diffing that understands DOM hierarchy.
          </p>
          <CodeBlock code={`import { diff, HTMLDOMPlugin } from '@oxog/diffkit';

const result = diff(oldHtml, newHtml, {
  plugins: [
    new HTMLDOMPlugin({
      ignoreAttributes: ['id', 'class'],
      ignoreWhitespace: true,
    }),
  ],
});`} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Markdown Plugin</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Structure-aware Markdown diffing.
          </p>
          <CodeBlock code={`import { diff, MarkdownPlugin } from '@oxog/diffkit';

const result = diff(oldMarkdown, newMarkdown, {
  plugins: [
    new MarkdownPlugin({
      preserveFormatting: true,
    }),
  ],
});`} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Multiple Plugins</h2>
          <CodeBlock code={`import {
  diff,
  SyntaxHighlightPlugin,
  HTMLTextPlugin,
} from '@oxog/diffkit';

const result = diff(oldHtml, newHtml, {
  plugins: [
    new HTMLTextPlugin(),
    new SyntaxHighlightPlugin({ language: 'html' }),
  ],
});`} />
        </div>
      </div>
    </div>
  );
}

function ReactExample() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">React Components</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Use DiffKit's React components for easy integration.
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Usage</h2>
          <CodeBlock code={`import { DiffView } from '@oxog/diffkit/react';

function MyDiff() {
  return (
    <DiffView
      oldText="Hello World"
      newText="Hello Universe"
      viewMode="unified"
    />
  );
}`} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">With Theme Provider</h2>
          <CodeBlock code={`import { ThemeProvider, DiffView } from '@oxog/diffkit/react';

function App() {
  return (
    <ThemeProvider theme="github-dark">
      <DiffView
        oldText={oldCode}
        newText={newCode}
        viewMode="split"
        options={{
          algorithm: 'patience',
          lineNumbers: true,
        }}
      />
    </ThemeProvider>
  );
}`} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Using Hooks</h2>
          <CodeBlock code={`import { useDiff, useTheme } from '@oxog/diffkit/react';

function CustomDiff({ oldText, newText }) {
  const { result, html, stats } = useDiff(oldText, newText, {
    algorithm: 'patience',
    viewMode: 'unified',
  });

  const { theme, setTheme } = useTheme();

  return (
    <div>
      <div className="stats">
        Added: {stats.additions}, Removed: {stats.deletions}
      </div>
      <select onChange={(e) => setTheme(e.target.value)}>
        <option value="github-dark">GitHub Dark</option>
        <option value="github-light">GitHub Light</option>
      </select>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}`} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Specific View Components</h2>
          <CodeBlock code={`import {
  UnifiedView,
  SplitView,
  InlineView
} from '@oxog/diffkit/react';

// Use specific view components for more control
<UnifiedView oldText={old} newText={new} lineNumbers />
<SplitView oldText={old} newText={new} syncScroll />
<InlineView oldText={old} newText={new} />`} />
        </div>
      </div>
    </div>
  );
}

function CustomThemeExample() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Custom Themes</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create custom themes to match your application's design.
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create a Theme</h2>
          <CodeBlock code={`import { createTheme } from '@oxog/diffkit';

const myTheme = createTheme({
  name: 'my-custom-theme',
  colors: {
    background: '#1a1a2e',
    foreground: '#eaeaea',
    added: '#00ff88',
    addedBackground: 'rgba(0, 255, 136, 0.1)',
    removed: '#ff4444',
    removedBackground: 'rgba(255, 68, 68, 0.1)',
    modified: '#ffaa00',
    modifiedBackground: 'rgba(255, 170, 0, 0.1)',
    lineNumbers: '#666',
    lineNumbersBackground: '#0d0d1a',
    border: '#333',
    syntax: {
      keyword: '#ff79c6',
      string: '#f1fa8c',
      comment: '#6272a4',
      function: '#50fa7b',
      variable: '#bd93f9',
      number: '#bd93f9',
      operator: '#ff79c6',
      punctuation: '#f8f8f2',
    },
  },
});`} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Extend Existing Theme</h2>
          <CodeBlock code={`import { createTheme, getTheme } from '@oxog/diffkit';

const baseTheme = getTheme('github-dark');

const myTheme = createTheme({
  name: 'my-github-variant',
  extends: baseTheme,
  colors: {
    // Only override what you need
    added: '#00ff00',
    removed: '#ff0000',
  },
});`} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Using CSS Variables</h2>
          <CodeBlock code={`import { generateCSSVariables, createTheme } from '@oxog/diffkit';

const theme = createTheme({ /* ... */ });
const cssVars = generateCSSVariables(theme);

// Output:
// --diffkit-bg: #1a1a2e;
// --diffkit-fg: #eaeaea;
// --diffkit-added: #00ff88;
// ...

// Use in your CSS:
// .diff-container {
//   background: var(--diffkit-bg);
//   color: var(--diffkit-fg);
// }`} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Register Theme</h2>
          <CodeBlock code={`import { registerTheme, getTheme } from '@oxog/diffkit';

// Register your custom theme
registerTheme(myTheme);

// Now you can use it by name
const theme = getTheme('my-custom-theme');`} />
        </div>
      </div>
    </div>
  );
}

function ExampleIndex() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Examples</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore practical examples to learn how to use DiffKit effectively.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {examples.map((example) => (
          <Link
            key={example.id}
            to={`/examples/${example.id}`}
            className="block p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {example.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {example.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ExamplesPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <ExampleSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl">
          <Routes>
            <Route index element={<ExampleIndex />} />
            <Route path="basic" element={<BasicExample />} />
            <Route path="code" element={<CodeExample />} />
            <Route path="algorithms" element={<AlgorithmsExample />} />
            <Route path="views" element={<ViewsExample />} />
            <Route path="themes" element={<ThemesExample />} />
            <Route path="plugins" element={<PluginsExample />} />
            <Route path="react" element={<ReactExample />} />
            <Route path="custom-theme" element={<CustomThemeExample />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
