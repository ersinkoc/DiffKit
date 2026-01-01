/**
 * Tests for plugin registry
 */

import {
  pluginRegistry,
  registerPlugin,
  getPlugin,
  listPlugins,
} from '../../src/plugins/registry.js';
import type { DiffPlugin } from '../../src/plugins/types.js';

describe('PluginRegistry', () => {
  // Create a test plugin
  const createTestPlugin = (name: string): DiffPlugin => ({
    name,
    version: '1.0.0',
    description: `Test plugin ${name}`,
  });

  beforeEach(() => {
    // Clear registry before each test
    pluginRegistry.clear();
  });

  describe('register', () => {
    it('should register a plugin', () => {
      const plugin = createTestPlugin('test-plugin');
      pluginRegistry.register(plugin);

      expect(pluginRegistry.has('test-plugin')).toBe(true);
    });

    it('should throw error when registering duplicate plugin', () => {
      const plugin = createTestPlugin('duplicate');
      pluginRegistry.register(plugin);

      expect(() => pluginRegistry.register(plugin)).toThrow(
        'Plugin "duplicate" is already registered'
      );
    });
  });

  describe('get', () => {
    it('should return registered plugin', () => {
      const plugin = createTestPlugin('get-test');
      pluginRegistry.register(plugin);

      const retrieved = pluginRegistry.get('get-test');
      expect(retrieved).toBe(plugin);
    });

    it('should return undefined for non-existent plugin', () => {
      const retrieved = pluginRegistry.get('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for registered plugin', () => {
      const plugin = createTestPlugin('has-test');
      pluginRegistry.register(plugin);

      expect(pluginRegistry.has('has-test')).toBe(true);
    });

    it('should return false for non-existent plugin', () => {
      expect(pluginRegistry.has('non-existent')).toBe(false);
    });
  });

  describe('unregister', () => {
    it('should unregister a plugin', () => {
      const plugin = createTestPlugin('unregister-test');
      pluginRegistry.register(plugin);

      const result = pluginRegistry.unregister('unregister-test');

      expect(result).toBe(true);
      expect(pluginRegistry.has('unregister-test')).toBe(false);
    });

    it('should return false for non-existent plugin', () => {
      const result = pluginRegistry.unregister('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('list', () => {
    it('should list all registered plugin names', () => {
      pluginRegistry.register(createTestPlugin('plugin-a'));
      pluginRegistry.register(createTestPlugin('plugin-b'));
      pluginRegistry.register(createTestPlugin('plugin-c'));

      const names = pluginRegistry.list();

      expect(names).toContain('plugin-a');
      expect(names).toContain('plugin-b');
      expect(names).toContain('plugin-c');
      expect(names).toHaveLength(3);
    });

    it('should return empty array when no plugins registered', () => {
      const names = pluginRegistry.list();
      expect(names).toEqual([]);
    });
  });

  describe('all', () => {
    it('should return all registered plugins', () => {
      const pluginA = createTestPlugin('plugin-a');
      const pluginB = createTestPlugin('plugin-b');

      pluginRegistry.register(pluginA);
      pluginRegistry.register(pluginB);

      const plugins = pluginRegistry.all();

      expect(plugins).toContain(pluginA);
      expect(plugins).toContain(pluginB);
      expect(plugins).toHaveLength(2);
    });

    it('should return empty array when no plugins registered', () => {
      const plugins = pluginRegistry.all();
      expect(plugins).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should clear all plugins', () => {
      pluginRegistry.register(createTestPlugin('plugin-a'));
      pluginRegistry.register(createTestPlugin('plugin-b'));

      pluginRegistry.clear();

      expect(pluginRegistry.list()).toEqual([]);
    });
  });
});

describe('Global plugin functions', () => {
  beforeEach(() => {
    pluginRegistry.clear();
  });

  describe('registerPlugin', () => {
    it('should register plugin globally', () => {
      const plugin: DiffPlugin = {
        name: 'global-test',
        version: '1.0.0',
        description: 'Test',
      };

      registerPlugin(plugin);

      expect(pluginRegistry.has('global-test')).toBe(true);
    });
  });

  describe('getPlugin', () => {
    it('should get plugin by name', () => {
      const plugin: DiffPlugin = {
        name: 'get-global-test',
        version: '1.0.0',
        description: 'Test',
      };

      registerPlugin(plugin);

      const retrieved = getPlugin('get-global-test');
      expect(retrieved).toBe(plugin);
    });

    it('should return undefined for non-existent plugin', () => {
      const retrieved = getPlugin('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('listPlugins', () => {
    it('should list all plugin names', () => {
      registerPlugin({ name: 'list-a', version: '1.0.0', description: 'A' });
      registerPlugin({ name: 'list-b', version: '1.0.0', description: 'B' });

      const names = listPlugins();

      expect(names).toContain('list-a');
      expect(names).toContain('list-b');
    });
  });
});
