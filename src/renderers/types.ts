/**
 * Renderer type definitions for DiffKit
 */

import type { Hunk, Theme, DiffResult, HTMLRendererOptions } from '../core/types.js';

export type { HTMLRendererOptions };

export type ViewMode = 'unified' | 'split' | 'inline';

/**
 * Base renderer interface
 */
export interface Renderer {
  render(result: DiffResult): string;
}

/**
 * HTML renderer interface
 */
export interface HTMLRenderer extends Renderer {
  mode: ViewMode;
  theme: Theme | string;
  options: HTMLRendererOptions;
  setMode(mode: ViewMode): void;
  setTheme(theme: Theme | string): void;
}

/**
 * Line render data
 */
export interface LineRenderData {
  type: 'add' | 'delete' | 'normal' | 'empty';
  content: string;
  lineNumber?: number;
  tokens?: { value: string; type?: string }[];
}

/**
 * Hunk render data
 */
export interface HunkRenderData {
  header: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: LineRenderData[];
}

/**
 * Split view line pair
 */
export interface SplitLinePair {
  left: LineRenderData | null;
  right: LineRenderData | null;
}

/**
 * Render context passed to renderers
 */
export interface RenderContext {
  hunks: Hunk[];
  theme: Theme;
  options: HTMLRendererOptions;
}
