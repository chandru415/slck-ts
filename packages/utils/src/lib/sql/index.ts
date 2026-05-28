// ─── SQL Expression Parser Types & Utilities ─────────────────────────────────

/**
 * Token type represents a lexical token in a custom SQL expression.
 */
export interface SQLCustomToken {
  key: string | number | boolean;
  value: string | number | boolean;
  dataType?: string;
}

/**
 * AST node for parsed SQL expressions.
 */
export interface ASTNode {
  type: string | null;
  value?: string | number | boolean;
  left?: ASTNode;
  right?: ASTNode;
  func?: string;
  args?: ASTNode[];
  op?: string;
}

/**
 * Parse result — either valid with AST or invalid with errors.
 */
export type ParseResult =
  | { valid: true; ast: ASTNode }
  | { valid: false; errors: { message: string; index: number }[] };

// ─── Constants ───────────────────────────────────────────────────────────────

export const MSSQL_DATEDIFF_PARTS = [
  'year', 'quarter', 'month', 'dayofyear', 'day', 'week',
  'weekday', 'hour', 'minute', 'second', 'millisecond', 'microsecond',
] as const;

export const SQL_FUNCTION_NAMES = [
  'SUM', 'AVG', 'ROUND', 'RATIO', 'CONCAT', 'COUNT', 'MIN', 'MAX', 'DATEDIFF',
] as const;

export type FunctionName = (typeof SQL_FUNCTION_NAMES)[number];

// ─── Function Definitions ────────────────────────────────────────────────────

interface FunctionDefinition {
  validate: (
    func: FunctionName,
    args: ASTNode[],
    index: number,
    error: (msg: string, idx?: number) => void,
  ) => void;
  returns: string;
}

const isNumericType = (type?: string | null): boolean =>
  ['int', 'float', 'decimal', 'number'].includes(type || '');

const isDateType = (arg: ASTNode): boolean =>
  ['date', 'datetime', 'timestamp', 'DateTime'].includes(
    (arg.type ?? '').toString(),
  );

export const FUNCTIONS: Record<FunctionName, FunctionDefinition> = {
  SUM: {
    validate: (func, args, idx, error) => {
      args.forEach((arg) => {
        if (!isNumericType(arg.type)) error(`${func} requires numeric argument`, idx);
      });
    },
    returns: 'number',
  },
  AVG: {
    validate: (func, args, idx, error) => {
      args.forEach((arg) => {
        if (!isNumericType(arg.type)) error(`${func} requires numeric argument`, idx);
      });
    },
    returns: 'number',
  },
  ROUND: {
    validate: (_func, args, idx, error) => {
      if (args.length !== 1) error('ROUND requires exactly 1 argument', idx);
      else if (!isNumericType(args[0].type)) error('ROUND requires numeric argument', idx);
    },
    returns: 'number',
  },
  RATIO: {
    validate: (_func, args, idx, error) => {
      if (args.length !== 2) error('RATIO requires exactly 2 numeric arguments', idx);
      else args.forEach((arg) => {
        if (!isNumericType(arg.type)) error('RATIO requires numeric arguments', idx);
      });
    },
    returns: 'number',
  },
  CONCAT: {
    validate: (_func, args, idx, error) => {
      args.forEach((arg) => {
        if (arg.type !== 'string') error('CONCAT requires string arguments', idx);
      });
    },
    returns: 'string',
  },
  COUNT: {
    validate: (_func, args, idx, error) => {
      if (args.length !== 1) { error('COUNT requires exactly 1 argument', idx); return; }
      if (args[0].value !== '*' && !args[0].type) error("COUNT requires a column or '*'", idx);
    },
    returns: 'number',
  },
  MIN: {
    validate: (_func, args, idx, error) => {
      if (args.length !== 1) { error('MIN requires exactly 1 argument', idx); return; }
      if (!isNumericType(args[0].type)) error('MIN requires a numeric argument', idx);
    },
    returns: 'number',
  },
  MAX: {
    validate: (_func, args, idx, error) => {
      if (args.length !== 1) { error('MAX requires exactly 1 argument', idx); return; }
      if (!isNumericType(args[0].type)) error('MAX requires a numeric argument', idx);
    },
    returns: 'number',
  },
  DATEDIFF: {
    validate: (_func, args, idx, error) => {
      if (args.length !== 3) {
        return error('DATEDIFF requires 3 arguments: part, startDate, endDate', idx);
      }
      const datepart = (String(args[0].value) ?? '').toLowerCase();
      if (!MSSQL_DATEDIFF_PARTS.includes(datepart as typeof MSSQL_DATEDIFF_PARTS[number])) {
        error(`Invalid DATEDIFF part '${args[0].value}'`, idx);
      }
      if (!isDateType(args[1]) || !isDateType(args[2])) {
        error('DATEDIFF requires start & end as DATE/DATETIME', idx);
      }
    },
    returns: 'number',
  },
};

// ─── Parser ──────────────────────────────────────────────────────────────────

/**
 * Parses a custom SQL expression from tokens.
 * Returns an AST if valid, or errors describing failures.
 */
export function parseSqlCustomExpressionTokens(tokens: SQLCustomToken[]): ParseResult {
  let index = 0;
  const errors: { message: string; index: number }[] = [];

  const peek = () => tokens[index];
  const consume = () => tokens[index++];
  const error = (message: string, idx: number = index) =>
    errors.push({ message, index: idx });

  function parseFactor(): ASTNode {
    const token = peek();
    if (!token) { error('Unexpected end of expression', index - 1); return { type: null }; }

    if (token.key === '(') {
      consume();
      const expr = parseExpression();
      if (peek()?.key === ')') consume();
      else error("Missing closing ')'", index);
      return expr;
    }

    if (SQL_FUNCTION_NAMES.includes(token.key as FunctionName)) {
      return parseFunction();
    }

    if (!token.dataType && MSSQL_DATEDIFF_PARTS.includes(String(token.key).toLowerCase() as typeof MSSQL_DATEDIFF_PARTS[number])) {
      consume();
      return { type: 'string', value: token.key };
    }

    if (token.dataType) { consume(); return { type: token.dataType, value: token.key }; }

    error(`Unexpected token '${token.key}'`, index);
    consume();
    return { type: null };
  }

  function parseFunction(): ASTNode {
    const funcToken = consume();
    const funcIndex = index - 1;
    const funcName = funcToken.key as FunctionName;

    if (peek()?.key !== '(') { error(`Function ${funcName} must be followed by '('`, funcIndex); return { type: null }; }
    consume();

    const args: ASTNode[] = [];
    while (peek() && peek()?.key !== ')') {
      args.push(parseExpression());
      if (peek()?.key === ',') consume();
    }

    if (peek()?.key === ')') consume();
    else error(`Missing ')' for function ${funcName}`, funcIndex);

    FUNCTIONS[funcName].validate(funcName, args, funcIndex, error);
    return { type: FUNCTIONS[funcName].returns, func: funcName, args };
  }

  function parseTerm(): ASTNode {
    let node = parseFactor();
    while (peek() && (peek().key === '*' || peek().key === '/')) {
      const op = consume();
      const right = parseFactor();
      if (!isNumericType(node.type) || !isNumericType(right.type))
        error(`Operator '${op.key}' requires numeric operands`);
      node = { type: 'number', left: node, op: op.key as string, right };
    }
    return node;
  }

  function parseExpression(): ASTNode {
    let node = parseTerm();
    while (peek() && (peek().key === '+' || peek().key === '-')) {
      const op = consume();
      const opIndex = index - 1;
      const right = parseTerm();

      if (isNumericType(node.type) && isNumericType(right.type)) {
        node = { type: 'number', left: node, op: op.key as string, right };
      } else if (node.type === 'string' && right.type === 'string' && op.key === '+') {
        node = { type: 'string', left: node, op: op.key as string, right };
      } else {
        error(`Operator '${op.key}' type mismatch between ${node.type} and ${right.type}`, opIndex);
        node = { type: null, left: node, op: op.key as string, right };
      }
    }
    return node;
  }

  const ast = parseExpression();
  if (index < tokens.length) error('Extra tokens after valid expression', index);

  return errors.length ? { valid: false, errors } : { valid: true, ast };
}

// ─── Token Helpers ───────────────────────────────────────────────────────────

/**
 * Builds a typed SQLCustomToken from a raw value.
 */
export function buildExpressionToken(raw: unknown): SQLCustomToken {
  if (typeof raw === 'object' && raw !== null && 'key' in raw && 'value' in raw) {
    return raw as SQLCustomToken;
  }

  if (typeof raw === 'number') {
    return { key: raw, value: raw, dataType: 'number' };
  }

  if (typeof raw === 'string') {
    if (['true', 'false'].includes(raw.toLowerCase())) {
      return { key: raw === 'true', value: raw === 'true', dataType: 'boolean' };
    }
    if (raw.trim() !== '' && !isNaN(Number(raw))) {
      return { key: Number(raw), value: Number(raw), dataType: 'number' };
    }
    if (MSSQL_DATEDIFF_PARTS.includes(raw.toLowerCase() as typeof MSSQL_DATEDIFF_PARTS[number])) {
      return { key: raw, value: raw, dataType: 'string' };
    }
    return { key: `'${raw.replace(/'/g, "''")}'`, value: raw, dataType: 'string' };
  }

  return { key: String(raw), value: raw as string, dataType: 'undefined' };
}

/**
 * @deprecated Use `buildExpressionToken` instead.
 */
export const buildExpressionTokenFromPlain = buildExpressionToken;

/**
 * Evaluates the return type from the first token in an expression.
 */
export function evaluateReturnTypeFromTokens(tokens: SQLCustomToken[]): string | null {
  if (!tokens || tokens.length === 0) return null;
  const firstToken = tokens[0];
  if (typeof firstToken.key === 'string') {
    const funcName = firstToken.key as FunctionName;
    if (FUNCTIONS[funcName]) return FUNCTIONS[funcName].returns;
  }
  return firstToken.dataType ?? null;
}

/**
 * Returns true if the token is a known SQL function.
 */
export function isSQLFunctionToken(token: SQLCustomToken, functionList: SQLCustomToken[]): boolean {
  return functionList.some((fn) => fn.key === token.key);
}

/**
 * Returns true if the token is a parenthesis.
 */
export function isParen(token: SQLCustomToken): boolean {
  return !token.dataType && (token.key === '(' || token.key === ')');
}

/**
 * Returns true if the token is an opening parenthesis.
 */
export function isOpenParen(token: SQLCustomToken): boolean {
  return !token.dataType && token.key === '(';
}

/**
 * Returns true if the token is a closing parenthesis.
 */
export function isCloseParen(token: SQLCustomToken): boolean {
  return !token.dataType && token.key === ')';
}

/**
 * Finds the matching closing parenthesis index.
 */
export function findMatchingCloseParen(tokens: SQLCustomToken[], startIndex: number): number {
  let depth = 0;
  for (let i = startIndex; i < tokens.length; i++) {
    if (isOpenParen(tokens[i])) depth++;
    if (isCloseParen(tokens[i])) depth--;
    if (depth === 0) return i;
  }
  return startIndex;
}

/**
 * @deprecated Use `findMatchingCloseParen` instead.
 */
export const findMatchingOpenCloseParen = findMatchingCloseParen;

/**
 * Helper to check if a type string is numeric.
 */
export const isNumeric = isNumericType;
