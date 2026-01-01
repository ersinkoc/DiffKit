/**
 * Main DiffView component
 * Auto-selects the appropriate view based on mode prop
 */

import type { DiffViewProps } from './types.js';
import { UnifiedView } from './UnifiedView.js';
import { SplitView } from './SplitView.js';
import { InlineView } from './InlineView.js';

/**
 * Main diff view component
 * Automatically selects the appropriate view based on the mode prop
 */
export function DiffView({
  mode = 'unified',
  ...props
}: DiffViewProps) {
  switch (mode) {
    case 'split':
      return <SplitView {...props} />;
    case 'inline':
      return <InlineView {...props} />;
    case 'unified':
    default:
      return <UnifiedView {...props} />;
  }
}

export default DiffView;
