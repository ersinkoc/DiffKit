import { Link } from 'react-router-dom';
import { useState } from 'react';

function HomePage() {
  const [viewMode, setViewMode] = useState<'unified' | 'split' | 'inline'>('unified');

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Universal Diff Toolkit
          </h1>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            Zero dependencies. Compare anything, customize everything.
            The most flexible diff library for JavaScript and TypeScript.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/docs"
              className="bg-white text-brand-600 px-6 py-3 rounded-lg font-semibold hover:bg-brand-50 transition-colors"
            >
              Get Started
            </Link>
            <a
              href="https://github.com/ersinkoc/diffkit"
              className="border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              View on GitHub
            </a>
          </div>
          <div className="mt-8">
            <code className="bg-brand-900/50 px-4 py-2 rounded text-brand-100">
              npm install @oxog/diffkit
            </code>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="0"
              title="Zero Dependencies"
              description="Lightweight and self-contained. No external runtime dependencies."
            />
            <FeatureCard
              icon="3"
              title="Multiple Algorithms"
              description="Myers, Patience, and Histogram algorithms for different use cases."
            />
            <FeatureCard
              icon="V"
              title="View Modes"
              description="Unified, Split, and Inline views with customizable rendering."
            />
            <FeatureCard
              icon="S"
              title="Syntax Highlighting"
              description="Built-in support for JavaScript, TypeScript, Python, CSS, and more."
            />
            <FeatureCard
              icon="T"
              title="Theming System"
              description="Pre-built themes with CSS variables and custom theme support."
            />
            <FeatureCard
              icon="R"
              title="React Components"
              description="Ready-to-use React components with hooks for easy integration."
            />
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Live Demo</h2>
          <p className="text-gray-600 text-center mb-8">
            See DiffKit in action with different view modes
          </p>

          <div className="flex justify-center gap-2 mb-8">
            {(['unified', 'split', 'inline'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-2 bg-gray-50 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
              <span className="ml-4 text-sm text-gray-500">example.ts</span>
            </div>
            <div className="p-4 font-mono text-sm">
              {viewMode === 'unified' && (
                <div>
                  <div className="text-gray-500">@@ -1,4 +1,4 @@</div>
                  <div className="bg-red-50 text-red-800">- function greet(name) {'{'}</div>
                  <div className="bg-green-50 text-green-800">+ function greet(name: string) {'{'}</div>
                  <div className="bg-red-50 text-red-800">-   console.log("Hello, " + name);</div>
                  <div className="bg-green-50 text-green-800">+   console.log(`Hello, {'$'}{'{'}name{'}'}!`);</div>
                  <div className="bg-red-50 text-red-800">-   return true;</div>
                  <div className="bg-green-50 text-green-800">+   return {'{'} success: true {'}'};</div>
                  <div>  {'}'}</div>
                </div>
              )}
              {viewMode === 'split' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-r border-gray-200 pr-4">
                    <div className="text-gray-500 text-xs mb-2">Original</div>
                    <div className="bg-red-50 text-red-800">function greet(name) {'{'}</div>
                    <div className="bg-red-50 text-red-800">  console.log("Hello, " + name);</div>
                    <div className="bg-red-50 text-red-800">  return true;</div>
                    <div>{'}'}</div>
                  </div>
                  <div className="pl-4">
                    <div className="text-gray-500 text-xs mb-2">Modified</div>
                    <div className="bg-green-50 text-green-800">function greet(name: string) {'{'}</div>
                    <div className="bg-green-50 text-green-800">  console.log(`Hello, {'$'}{'{'}name{'}'}!`);</div>
                    <div className="bg-green-50 text-green-800">  return {'{'} success: true {'}'};</div>
                    <div>{'}'}</div>
                  </div>
                </div>
              )}
              {viewMode === 'inline' && (
                <div>
                  <div>function greet(name<del className="bg-red-100 text-red-800 line-through"></del><ins className="bg-green-100 text-green-800">: string</ins>) {'{'}</div>
                  <div>  console.log(<del className="bg-red-100 text-red-800 line-through">"Hello, " + name</del><ins className="bg-green-100 text-green-800">`Hello, {'$'}{'{'}name{'}'}!`</ins>);</div>
                  <div>  return <del className="bg-red-100 text-red-800 line-through">true</del><ins className="bg-green-100 text-green-800">{'{'} success: true {'}'}</ins>;</div>
                  <div>{'}'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Quick Start</h2>
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="flex border-b border-gray-700">
                <div className="px-4 py-2 text-sm text-gray-400">Installation</div>
              </div>
              <pre className="p-4 text-gray-100 overflow-x-auto">
                <code>npm install @oxog/diffkit</code>
              </pre>
            </div>

            <div className="mt-8 bg-gray-900 rounded-xl overflow-hidden">
              <div className="flex border-b border-gray-700">
                <div className="px-4 py-2 text-sm text-gray-400">Basic Usage</div>
              </div>
              <pre className="p-4 text-gray-100 overflow-x-auto">
                <code>{`import { createDiff } from '@oxog/diffkit';

const diff = createDiff(
  'Hello World',
  'Hello DiffKit'
);

console.log(diff.stats);
// { additions: 1, deletions: 1, changes: 2 }

// Get HTML output
const html = diff.toHTML();`}</code>
              </pre>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
              >
                Read the Documentation
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center text-xl font-bold mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default HomePage;
