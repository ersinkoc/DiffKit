import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Feature icons as components
const icons = {
  zero: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  algorithm: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  view: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  syntax: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  theme: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  react: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
    </svg>
  ),
};

// Additional feature icons
const moreIcons = {
  word: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  semantic: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8h8M8 12h8M8 16h4" />
    </svg>
  ),
  move: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
};

const features = [
  {
    icon: icons.zero,
    title: 'Zero Dependencies',
    description: 'Lightweight and self-contained. No external runtime dependencies to worry about.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: icons.algorithm,
    title: 'Multiple Algorithms',
    description: 'Myers, Patience, and Histogram algorithms optimized for different use cases.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: icons.view,
    title: 'Flexible Views',
    description: 'Unified, Split, and Inline views with virtual scrolling for large diffs.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: icons.syntax,
    title: 'Syntax Highlighting',
    description: 'Built-in support for JavaScript, TypeScript, Python, Go, Rust, Java, C++, SQL, and more.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: icons.theme,
    title: 'Theming System',
    description: 'Five beautiful themes with CSS variables and custom theme support.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: icons.react,
    title: 'React Components',
    description: 'Ready-to-use React components with hooks, keyboard navigation, and accessibility.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: moreIcons.word,
    title: 'Word-Level Diffs',
    description: 'Character and word-level highlighting to show exactly what changed within lines.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: moreIcons.semantic,
    title: 'Semantic Diff',
    description: 'Structure-aware diffing for JSON and YAML with path-based change reporting.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: moreIcons.move,
    title: 'Move Detection',
    description: 'Detect moved and copied blocks of code with exact and fuzzy matching.',
    color: 'from-teal-500 to-green-500',
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="feature-card group"
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

function DiffDemo() {
  const [viewMode, setViewMode] = useState<'unified' | 'split' | 'inline'>('unified');

  const diffLines = {
    unified: [
      { type: 'header', content: '@@ -1,4 +1,4 @@' },
      { type: 'normal', content: 'function greet(name) {', lineOld: 1, lineNew: 1 },
      { type: 'remove', content: '  console.log("Hello, " + name);', lineOld: 2 },
      { type: 'add', content: '  console.log(`Hello, ${name}!`);', lineNew: 2 },
      { type: 'remove', content: '  return true;', lineOld: 3 },
      { type: 'add', content: '  return { success: true };', lineNew: 3 },
      { type: 'normal', content: '}', lineOld: 4, lineNew: 4 },
    ],
    split: {
      left: [
        { line: 1, content: 'function greet(name) {', type: 'normal' },
        { line: 2, content: '  console.log("Hello, " + name);', type: 'remove' },
        { line: 3, content: '  return true;', type: 'remove' },
        { line: 4, content: '}', type: 'normal' },
      ],
      right: [
        { line: 1, content: 'function greet(name) {', type: 'normal' },
        { line: 2, content: '  console.log(`Hello, ${name}!`);', type: 'add' },
        { line: 3, content: '  return { success: true };', type: 'add' },
        { line: 4, content: '}', type: 'normal' },
      ],
    },
    inline: [
      { content: 'function greet(name) {' },
      { content: '  console.log(', parts: [
        { text: '"Hello, " + name', type: 'remove' },
        { text: '`Hello, ${name}!`', type: 'add' },
      ]},
      { content: '  return ', parts: [
        { text: 'true', type: 'remove' },
        { text: '{ success: true }', type: 'add' },
      ]},
      { content: '}' },
    ],
  };

  return (
    <div className="diff-viewer shadow-2xl">
      <div className="diff-header">
        <div className="diff-dot bg-red-500" />
        <div className="diff-dot bg-yellow-500" />
        <div className="diff-dot bg-green-500" />
        <span className="ml-4 text-sm text-gray-500 dark:text-gray-400 font-mono">example.ts</span>
        <div className="ml-auto flex gap-1">
          {(['unified', 'split', 'inline'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`tab-button ${viewMode === mode ? 'active' : ''}`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="diff-content p-4">
        {viewMode === 'unified' && (
          <div className="space-y-0.5">
            {diffLines.unified.map((line, i) => (
              <div
                key={i}
                className={`diff-line rounded ${
                  line.type === 'add' ? 'diff-add' :
                  line.type === 'remove' ? 'diff-remove' :
                  line.type === 'header' ? 'text-cyan-600 dark:text-cyan-400' : ''
                }`}
              >
                {line.type !== 'header' && (
                  <span className="diff-line-number">
                    {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                  </span>
                )}
                <span className="diff-line-content">{line.content}</span>
              </div>
            ))}
          </div>
        )}
        {viewMode === 'split' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="border-r border-gray-200 dark:border-gray-800 pr-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">Original</div>
              {diffLines.split.left.map((line, i) => (
                <div key={i} className={`diff-line rounded ${line.type === 'remove' ? 'diff-remove' : ''}`}>
                  <span className="diff-line-number">{line.line}</span>
                  <span className="diff-line-content">{line.content}</span>
                </div>
              ))}
            </div>
            <div className="pl-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">Modified</div>
              {diffLines.split.right.map((line, i) => (
                <div key={i} className={`diff-line rounded ${line.type === 'add' ? 'diff-add' : ''}`}>
                  <span className="diff-line-number">{line.line}</span>
                  <span className="diff-line-content">{line.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {viewMode === 'inline' && (
          <div className="space-y-0.5">
            {diffLines.inline.map((line, i) => (
              <div key={i} className="diff-line">
                <span className="diff-line-number">{i + 1}</span>
                <span className="diff-line-content">
                  {line.parts ? (
                    <>
                      {line.content}
                      {line.parts.map((part, j) => (
                        <span
                          key={j}
                          className={`px-1 rounded ${
                            part.type === 'add'
                              ? 'bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-200'
                              : 'bg-red-200 dark:bg-red-800/50 text-red-800 dark:text-red-200 line-through'
                          }`}
                        >
                          {part.text}
                        </span>
                      ))}
                      ;
                    </>
                  ) : (
                    line.content
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CodeBlock({ code, showCopy = true }: { code: string; showCopy?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <pre><code>{code}</code></pre>
      {showCopy && (
        <button onClick={handleCopy} className="copy-btn">
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
    </div>
  );
}

function Stats() {
  const stats = [
    { value: '0', label: 'Dependencies', suffix: '' },
    { value: '3', label: 'Algorithms', suffix: '' },
    { value: '920', label: 'Tests', suffix: '+' },
    { value: '100', label: 'TypeScript', suffix: '%' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="text-center"
        >
          <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
            {stat.value}{stat.suffix}
          </div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-20">
        {/* Animated background */}
        <div className="absolute inset-0 gradient-bg opacity-10 dark:opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-100/40 via-transparent to-transparent dark:from-brand-900/20" />

        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                v1.0.0 Now Available
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 text-balance"
            >
              Universal{' '}
              <span className="text-gradient">Diff Toolkit</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto text-balance"
            >
              Zero dependencies. Compare anything, customize everything.
              The most flexible diff library for JavaScript and TypeScript.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/docs" className="btn btn-primary text-lg">
                Get Started
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="https://github.com/ersinkoc/diffkit"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View on GitHub
              </a>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gray-900 dark:bg-gray-800 text-gray-100 font-mono text-lg shadow-xl">
                <span className="text-gray-500">$</span>
                <span>npm install @oxog/diffkit</span>
                <button
                  onClick={() => navigator.clipboard.writeText('npm install @oxog/diffkit')}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-gray-400 dark:border-gray-600 flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 rounded-full bg-gray-400 dark:bg-gray-600 mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Stats />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-heading">
              Everything you need for <span className="text-gradient">text comparison</span>
            </h2>
            <p className="section-subheading">
              A complete toolkit with powerful algorithms, beautiful rendering, and full customization.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-heading">
              See it in <span className="text-gradient">action</span>
            </h2>
            <p className="section-subheading">
              Try different view modes and see how DiffKit renders your changes beautifully.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <DiffDemo />
          </motion.div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Simple API,<br />
                <span className="text-gradient">Powerful Results</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Get started with just a few lines of code. DiffKit handles the complexity
                so you can focus on building great applications.
              </p>
              <div className="flex gap-4">
                <Link to="/docs" className="btn btn-primary">
                  Read the Docs
                </Link>
                <Link to="/examples" className="btn btn-ghost">
                  View Examples
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <CodeBlock code={`import { createDiff } from '@oxog/diffkit';

// Create a diff
const diff = createDiff(
  'Hello World',
  'Hello DiffKit'
);

// Get statistics
console.log(diff.stats);
// { additions: 1, deletions: 1, similarity: 0.5 }

// Render as HTML
const html = diff.toHTML({ mode: 'unified' });

// Or use React components
import { DiffView } from '@oxog/diffkit/react';

<DiffView
  oldText="Hello World"
  newText="Hello DiffKit"
  viewMode="split"
/>`} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 gradient-bg" />
            <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to get started?
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Install DiffKit now and start comparing text with the most flexible diff library available.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/docs"
                  className="btn bg-white text-brand-600 hover:bg-gray-100 text-lg"
                >
                  Get Started
                </Link>
                <a
                  href="https://github.com/ersinkoc/diffkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-white/20 text-white hover:bg-white/30 backdrop-blur text-lg"
                >
                  Star on GitHub
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
