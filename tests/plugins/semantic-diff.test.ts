/**
 * Tests for semantic diff plugin (JSON/YAML)
 */

import {
  diffJson,
  diffJsonStrings,
  formatJsonChanges,
  diffYaml,
  parseYaml,
  formatYamlChanges,
} from '../../src/plugins/semantic/index.js';

describe('JSON Semantic Diff', () => {
  describe('diffJson', () => {
    it('should detect no changes for identical objects', () => {
      const obj = { name: 'test', value: 42 };
      const result = diffJson(obj, obj);

      expect(result.isEqual).toBe(true);
      expect(result.changes).toHaveLength(0);
    });

    it('should detect added properties', () => {
      const oldObj = { name: 'test' };
      const newObj = { name: 'test', value: 42 };
      const result = diffJson(oldObj, newObj);

      expect(result.isEqual).toBe(false);
      expect(result.stats.additions).toBe(1);
      expect(result.changes[0]?.type).toBe('add');
      expect(result.changes[0]?.path).toBe('value');
      expect(result.changes[0]?.newValue).toBe(42);
    });

    it('should detect deleted properties', () => {
      const oldObj = { name: 'test', value: 42 };
      const newObj = { name: 'test' };
      const result = diffJson(oldObj, newObj);

      expect(result.isEqual).toBe(false);
      expect(result.stats.deletions).toBe(1);
      expect(result.changes[0]?.type).toBe('delete');
      expect(result.changes[0]?.path).toBe('value');
    });

    it('should detect modified values', () => {
      const oldObj = { name: 'test', value: 42 };
      const newObj = { name: 'test', value: 100 };
      const result = diffJson(oldObj, newObj);

      expect(result.isEqual).toBe(false);
      expect(result.stats.modifications).toBe(1);
      expect(result.changes[0]?.type).toBe('modify');
      expect(result.changes[0]?.oldValue).toBe(42);
      expect(result.changes[0]?.newValue).toBe(100);
    });

    it('should detect type changes', () => {
      const oldObj = { value: 42 };
      const newObj = { value: '42' };
      const result = diffJson(oldObj, newObj);

      expect(result.isEqual).toBe(false);
      expect(result.stats.typeChanges).toBe(1);
      expect(result.changes[0]?.type).toBe('type-change');
      expect(result.changes[0]?.oldType).toBe('number');
      expect(result.changes[0]?.newType).toBe('string');
    });

    it('should handle nested objects', () => {
      const oldObj = { user: { name: 'Alice', age: 30 } };
      const newObj = { user: { name: 'Bob', age: 30 } };
      const result = diffJson(oldObj, newObj);

      expect(result.isEqual).toBe(false);
      expect(result.changes[0]?.path).toBe('user.name');
      expect(result.changes[0]?.oldValue).toBe('Alice');
      expect(result.changes[0]?.newValue).toBe('Bob');
    });

    it('should handle arrays', () => {
      const oldObj = { items: [1, 2, 3] };
      const newObj = { items: [1, 2, 3, 4] };
      const result = diffJson(oldObj, newObj);

      expect(result.isEqual).toBe(false);
      expect(result.stats.additions).toBe(1);
      expect(result.changes[0]?.path).toBe('items[3]');
    });

    it('should handle array deletions', () => {
      const oldObj = { items: [1, 2, 3] };
      const newObj = { items: [1, 2] };
      const result = diffJson(oldObj, newObj);

      expect(result.isEqual).toBe(false);
      expect(result.stats.deletions).toBe(1);
    });

    it('should handle array modifications', () => {
      const oldObj = { items: [1, 2, 3] };
      const newObj = { items: [1, 5, 3] };
      const result = diffJson(oldObj, newObj);

      expect(result.isEqual).toBe(false);
      expect(result.changes.some(c => c.path === 'items[1]')).toBe(true);
    });

    it('should detect array moves when detectMoves is true', () => {
      const oldObj = { items: ['a', 'b', 'c'] };
      const newObj = { items: ['c', 'a', 'b'] };
      const result = diffJson(oldObj, newObj, { detectMoves: true });

      expect(result.isEqual).toBe(false);
      expect(result.stats.moves).toBeGreaterThan(0);
    });

    it('should ignore array order when ignoreArrayOrder is true', () => {
      const oldObj = { items: [1, 2, 3] };
      const newObj = { items: [3, 1, 2] };
      const result = diffJson(oldObj, newObj, { ignoreArrayOrder: true });

      expect(result.isEqual).toBe(true);
    });

    it('should respect maxDepth option', () => {
      const oldObj = { level1: { level2: { level3: 'old' } } };
      const newObj = { level1: { level2: { level3: 'new' } } };

      const fullResult = diffJson(oldObj, newObj);
      expect(fullResult.changes[0]?.path).toBe('level1.level2.level3');

      const limitedResult = diffJson(oldObj, newObj, { maxDepth: 1 });
      expect(limitedResult.changes[0]?.path).toBe('level1.level2');
    });

    it('should respect ignorePaths option', () => {
      const oldObj = { id: 1, name: 'test', timestamp: 12345 };
      const newObj = { id: 1, name: 'updated', timestamp: 67890 };

      const result = diffJson(oldObj, newObj, { ignorePaths: ['timestamp'] });

      expect(result.changes).toHaveLength(1);
      expect(result.changes[0]?.path).toBe('name');
    });

    it('should handle null values', () => {
      const oldObj = { value: 'test' };
      const newObj = { value: null };
      const result = diffJson(oldObj, newObj);

      expect(result.isEqual).toBe(false);
      expect(result.stats.typeChanges).toBe(1);
    });

    it('should treat null and undefined as equal when option is set', () => {
      const oldObj = { value: null };
      const newObj = { value: undefined };
      const result = diffJson(oldObj, newObj, { nullEqualsUndefined: true });

      expect(result.isEqual).toBe(true);
    });
  });

  describe('diffJsonStrings', () => {
    it('should parse and diff JSON strings', () => {
      const oldJson = '{"name": "test"}';
      const newJson = '{"name": "updated"}';
      const result = diffJsonStrings(oldJson, newJson);

      expect(result.isEqual).toBe(false);
      expect(result.changes[0]?.path).toBe('name');
    });
  });

  describe('formatJsonChanges', () => {
    it('should format changes as readable text', () => {
      const result = diffJson(
        { name: 'old', removed: true },
        { name: 'new', added: true }
      );

      const formatted = formatJsonChanges(result);

      expect(formatted).toContain('name');
      expect(formatted).toContain('removed');
      expect(formatted).toContain('added');
    });

    it('should return message for no changes', () => {
      const result = diffJson({ a: 1 }, { a: 1 });
      const formatted = formatJsonChanges(result);

      expect(formatted).toBe('No changes detected');
    });
  });
});

describe('YAML Semantic Diff', () => {
  describe('parseYaml', () => {
    it('should parse simple key-value pairs', () => {
      const yaml = `
name: test
value: 42
`;
      const result = parseYaml(yaml) as Record<string, unknown>;

      expect(result.name).toBe('test');
      expect(result.value).toBe(42);
    });

    it('should parse nested objects', () => {
      const yaml = `
user:
  name: Alice
  age: 30
`;
      const result = parseYaml(yaml) as Record<string, unknown>;

      expect((result.user as Record<string, unknown>).name).toBe('Alice');
      expect((result.user as Record<string, unknown>).age).toBe(30);
    });

    it('should parse arrays', () => {
      const yaml = `
items:
  - one
  - two
  - three
`;
      const result = parseYaml(yaml) as Record<string, unknown>;

      expect(Array.isArray(result.items)).toBe(true);
      expect((result.items as string[]).length).toBe(3);
    });

    it('should parse boolean values', () => {
      const yaml = `
enabled: true
disabled: false
`;
      const result = parseYaml(yaml) as Record<string, unknown>;

      expect(result.enabled).toBe(true);
      expect(result.disabled).toBe(false);
    });

    it('should parse null values', () => {
      const yaml = `
empty: null
tilde: ~
`;
      const result = parseYaml(yaml) as Record<string, unknown>;

      expect(result.empty).toBe(null);
      expect(result.tilde).toBe(null);
    });

    it('should handle comments', () => {
      const yaml = `
# This is a comment
name: test
# Another comment
value: 42
`;
      const result = parseYaml(yaml) as Record<string, unknown>;

      expect(result.name).toBe('test');
      expect(result.value).toBe(42);
    });

    it('should parse inline arrays', () => {
      const yaml = `
items: [1, 2, 3]
`;
      const result = parseYaml(yaml) as Record<string, unknown>;

      expect(result.items).toEqual([1, 2, 3]);
    });

    it('should parse inline objects', () => {
      const yaml = `
point: {x: 10, y: 20}
`;
      const result = parseYaml(yaml) as Record<string, unknown>;

      expect(result.point).toEqual({ x: 10, y: 20 });
    });
  });

  describe('diffYaml', () => {
    it('should diff simple YAML files', () => {
      const oldYaml = `
name: test
version: 1.0.0
`;
      const newYaml = `
name: test
version: 2.0.0
`;
      const result = diffYaml(oldYaml, newYaml);

      expect(result.isEqual).toBe(false);
      expect(result.changes.some(c => c.path === 'version')).toBe(true);
    });

    it('should detect added keys in YAML', () => {
      const oldYaml = `
name: test
`;
      const newYaml = `
name: test
description: A test package
`;
      const result = diffYaml(oldYaml, newYaml);

      expect(result.stats.additions).toBe(1);
    });

    it('should detect deleted keys in YAML', () => {
      const oldYaml = `
name: test
description: A test package
`;
      const newYaml = `
name: test
`;
      const result = diffYaml(oldYaml, newYaml);

      expect(result.stats.deletions).toBe(1);
    });

    it('should handle nested YAML structures', () => {
      const oldYaml = `
database:
  host: localhost
  port: 5432
`;
      const newYaml = `
database:
  host: production.db
  port: 5432
`;
      const result = diffYaml(oldYaml, newYaml);

      expect(result.changes[0]?.path).toBe('database.host');
    });
  });

  describe('formatYamlChanges', () => {
    it('should format YAML changes', () => {
      const result = diffYaml(
        'name: old',
        'name: new'
      );

      const formatted = formatYamlChanges(result);

      expect(formatted).toContain('name');
    });
  });
});

describe('Complex scenarios', () => {
  it('should handle deeply nested JSON', () => {
    const oldObj = {
      level1: {
        level2: {
          level3: {
            level4: {
              value: 'old',
            },
          },
        },
      },
    };
    const newObj = {
      level1: {
        level2: {
          level3: {
            level4: {
              value: 'new',
            },
          },
        },
      },
    };

    const result = diffJson(oldObj, newObj);

    expect(result.changes[0]?.path).toBe('level1.level2.level3.level4.value');
  });

  it('should handle arrays of objects', () => {
    const oldObj = {
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    };
    const newObj = {
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Robert' },
      ],
    };

    const result = diffJson(oldObj, newObj);

    // Check that there's a change related to users[1]
    expect(result.changes.some(c => c.path.startsWith('users[1]'))).toBe(true);
  });

  it('should handle mixed type arrays', () => {
    const oldObj = { items: [1, 'two', { three: 3 }] };
    const newObj = { items: [1, 'two', { three: 33 }] };

    const result = diffJson(oldObj, newObj);

    // Check that there's a change related to items[2]
    expect(result.changes.some(c => c.path.startsWith('items[2]'))).toBe(true);
  });

  it('should handle special characters in keys', () => {
    const oldObj = { 'my-key': 'old', 'another.key': 'old' };
    const newObj = { 'my-key': 'new', 'another.key': 'new' };

    const result = diffJson(oldObj, newObj);

    expect(result.changes).toHaveLength(2);
  });

  it('should handle empty objects and arrays', () => {
    const oldObj = { obj: {}, arr: [] };
    const newObj = { obj: { key: 'value' }, arr: [1] };

    const result = diffJson(oldObj, newObj);

    expect(result.stats.additions).toBe(2);
  });
});
