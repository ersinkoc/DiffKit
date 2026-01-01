/**
 * Plugin registry for DiffKit
 */

import type { DiffPlugin } from './types.js';

/**
 * Plugin registry class
 */
class PluginRegistry {
  private plugins: Map<string, DiffPlugin> = new Map();

  /**
   * Register a plugin
   */
  register(plugin: DiffPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Get a plugin by name
   */
  get(name: string): DiffPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Check if a plugin is registered
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Unregister a plugin
   */
  unregister(name: string): boolean {
    return this.plugins.delete(name);
  }

  /**
   * List all registered plugin names
   */
  list(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Get all registered plugins
   */
  all(): DiffPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Clear all registered plugins
   */
  clear(): void {
    this.plugins.clear();
  }
}

/**
 * Global plugin registry instance
 */
export const pluginRegistry = new PluginRegistry();

/**
 * Register a plugin globally
 */
export function registerPlugin(plugin: DiffPlugin): void {
  pluginRegistry.register(plugin);
}

/**
 * Get a plugin by name
 */
export function getPlugin(name: string): DiffPlugin | undefined {
  return pluginRegistry.get(name);
}

/**
 * List all registered plugins
 */
export function listPlugins(): string[] {
  return pluginRegistry.list();
}

export default pluginRegistry;
