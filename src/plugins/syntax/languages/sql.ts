/**
 * SQL tokenizer
 */

import type { Token } from '../../types.js';
import { createTokenizer, type TokenPattern } from '../tokenizer.js';

const patterns: TokenPattern[] = [
  // Comments
  { type: 'comment', pattern: /--.*$/ },
  { type: 'comment', pattern: /#.*$/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },

  // Strings
  { type: 'string', pattern: /'(?:[^']|'')*'/ },
  { type: 'string', pattern: /"(?:[^"]|"")*"/ },
  { type: 'string', pattern: /`[^`]*`/ },

  // Numbers
  { type: 'number', pattern: /\b\d+\.?\d*(?:e[+-]?\d+)?\b/i },

  // Keywords (DML)
  {
    type: 'keyword',
    pattern:
      /\b(?:SELECT|INSERT|UPDATE|DELETE|REPLACE|MERGE|UPSERT|FROM|WHERE|AND|OR|NOT|IN|IS|NULL|LIKE|ILIKE|BETWEEN|EXISTS|CASE|WHEN|THEN|ELSE|END|AS|ON|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|NATURAL|USING|HAVING|GROUP|BY|ORDER|ASC|DESC|NULLS|FIRST|LAST|LIMIT|OFFSET|FETCH|NEXT|ROWS|ONLY|TOP|DISTINCT|ALL|UNION|INTERSECT|EXCEPT|INTO|VALUES|SET|DEFAULT)\b/i,
  },

  // Keywords (DDL)
  {
    type: 'keyword',
    pattern:
      /\b(?:CREATE|ALTER|DROP|TRUNCATE|RENAME|TABLE|VIEW|INDEX|SCHEMA|DATABASE|SEQUENCE|TRIGGER|PROCEDURE|FUNCTION|CONSTRAINT|PRIMARY|FOREIGN|KEY|REFERENCES|UNIQUE|CHECK|CASCADE|RESTRICT|NO|ACTION|IF|EXISTS|TEMPORARY|TEMP|COLUMN|ADD|MODIFY|CHANGE)\b/i,
  },

  // Keywords (DCL/TCL)
  {
    type: 'keyword',
    pattern:
      /\b(?:GRANT|REVOKE|COMMIT|ROLLBACK|SAVEPOINT|BEGIN|TRANSACTION|START|WORK|LOCK|UNLOCK)\b/i,
  },

  // Data types
  {
    type: 'type',
    pattern:
      /\b(?:INT|INTEGER|SMALLINT|BIGINT|TINYINT|MEDIUMINT|DECIMAL|NUMERIC|FLOAT|DOUBLE|REAL|BIT|BOOLEAN|BOOL|DATE|TIME|DATETIME|TIMESTAMP|YEAR|CHAR|VARCHAR|TEXT|TINYTEXT|MEDIUMTEXT|LONGTEXT|BLOB|TINYBLOB|MEDIUMBLOB|LONGBLOB|BINARY|VARBINARY|ENUM|SET|JSON|XML|UUID|SERIAL|MONEY|INTERVAL|ARRAY|JSONB|BYTEA|CIDR|INET|MACADDR|POINT|LINE|POLYGON|CIRCLE|BOX|PATH)\b/i,
  },

  // Built-in functions
  {
    type: 'function',
    pattern:
      /\b(?:COUNT|SUM|AVG|MIN|MAX|ABS|CEIL|CEILING|FLOOR|ROUND|TRUNC|TRUNCATE|MOD|POWER|SQRT|EXP|LOG|LOG10|LN|SIGN|RAND|RANDOM|CONCAT|CONCAT_WS|LENGTH|CHAR_LENGTH|LOWER|UPPER|TRIM|LTRIM|RTRIM|LPAD|RPAD|LEFT|RIGHT|SUBSTRING|SUBSTR|REPLACE|REVERSE|POSITION|LOCATE|INSTR|COALESCE|NULLIF|IFNULL|NVL|NVL2|DECODE|GREATEST|LEAST|CAST|CONVERT|NOW|CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP|DATE_ADD|DATE_SUB|DATEDIFF|DATEPART|EXTRACT|YEAR|MONTH|DAY|HOUR|MINUTE|SECOND|DATE_FORMAT|TO_DATE|TO_CHAR|TO_NUMBER|ROW_NUMBER|RANK|DENSE_RANK|NTILE|LAG|LEAD|FIRST_VALUE|LAST_VALUE|OVER|PARTITION|WINDOW)(?=\s*\()/i,
  },

  // Boolean values
  { type: 'keyword', pattern: /\b(?:TRUE|FALSE)\b/i },

  // Identifiers (quoted or unquoted)
  { type: 'variable', pattern: /\[[^\]]+\]/ },
  { type: 'variable', pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },

  // Operators
  { type: 'operator', pattern: /[+\-*/%=<>!&|^~]+|::|<>|!=|<=|>=|\|\|/ },

  // Punctuation
  { type: 'punctuation', pattern: /[()[\]{};,.*]/ },
];

const tokenize = createTokenizer(patterns);

/**
 * Tokenize SQL code
 */
export function tokenizeSQL(content: string): Token[] {
  return tokenize(content);
}

export default tokenizeSQL;
