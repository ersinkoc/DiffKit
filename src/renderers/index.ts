/**
 * Renderers exports for DiffKit
 */

export type { ViewMode, Renderer, LineRenderData, HunkRenderData, SplitLinePair, RenderContext } from './types.js';
export type { HTMLRenderer as IHTMLRenderer } from './types.js';
export type { HTMLRendererOptions } from './types.js';
export * from './html/index.js';
// React exports are separate entry point: @oxog/diffkit/react
