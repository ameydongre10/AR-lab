/**
 * Boolean Algebra Expression Parser, Evaluator, and SOP/POS Normalizer
 * Ported and verified against ARLab.Simulation.BooleanExpression
 */

export type AstNode =
  | { kind: 'var'; name: string }
  | { kind: 'not'; inner: AstNode }
  | { kind: 'and'; a: AstNode; b: AstNode }
  | { kind: 'or'; a: AstNode; b: AstNode };

export class BooleanExpression {
  readonly source: string;
  readonly root: AstNode | null;
  readonly parseError: string | null;

  constructor(source: string, root: AstNode | null, error: string | null = null) {
    this.source = source;
    this.root = root;
    this.parseError = error;
  }

  get isValid(): boolean {
    return this.root !== null && this.parseError === null;
  }

  static parse(input: string): BooleanExpression {
    if (!input || input.trim() === '') {
      return new BooleanExpression(input, null, 'Expression is empty.');
    }

    try {
      // Clean up input: remove whitespace, replace · and * with empty (juxtaposition)
      const cleaned = input
        .replace(/\s+/g, '')
        .replace(/[*·]/g, '');

      const parser = new Parser(cleaned);
      const node = parser.parseExpr();

      if (!node || parser.pos !== cleaned.length) {
        return new BooleanExpression(input, null, 'Unexpected trailing input or syntax error.');
      }

      return new BooleanExpression(input, node, null);
    } catch (err: any) {
      return new BooleanExpression(input, null, err.message || 'Syntax error.');
    }
  }

  evaluate(assignment: Record<string, boolean>): boolean {
    if (!this.root) return false;
    return this.evalNode(this.root, assignment);
  }

  private evalNode(node: AstNode, assignment: Record<string, boolean>): boolean {
    switch (node.kind) {
      case 'var':
        return !!assignment[node.name.toUpperCase()];
      case 'not':
        return !this.evalNode(node.inner, assignment);
      case 'and':
        return this.evalNode(node.a, assignment) && this.evalNode(node.b, assignment);
      case 'or':
        return this.evalNode(node.a, assignment) || this.evalNode(node.b, assignment);
    }
  }

  variables(): string[] {
    const vars = new Set<string>();
    const walk = (n: AstNode | null) => {
      if (!n) return;
      if (n.kind === 'var') vars.add(n.name.toUpperCase());
      else if (n.kind === 'not') walk(n.inner);
      else { walk(n.a); walk(n.b); }
    };
    walk(this.root);
    return Array.from(vars).sort();
  }

  generateTruthTable(customVars?: string[]): {
    variables: string[];
    rows: { inputs: Record<string, boolean>; output: boolean; binary: string }[];
  } {
    const vars = customVars && customVars.length > 0 ? customVars : (this.variables().length > 0 ? this.variables() : ['A', 'B']);
    const rowCount = 1 << vars.length;
    const rows = [];

    // Standard MSB-first binary ordering: 00, 01, 10, 11
    for (let r = 0; r < rowCount; r++) {
      const inputs: Record<string, boolean> = {};
      let binaryStr = '';
      for (let i = 0; i < vars.length; i++) {
        const bitShift = vars.length - 1 - i;
        const val = ((r >> bitShift) & 1) === 1;
        inputs[vars[i]] = val;
        binaryStr += val ? '1' : '0';
      }
      const output = this.evaluate(inputs);
      rows.push({ inputs, output, binary: binaryStr });
    }

    return { variables: vars, rows };
  }

  toCanonicalSop(): string {
    const table = this.generateTruthTable();
    const minterms: string[] = [];

    for (const row of table.rows) {
      if (row.output) {
        const term = table.variables
          .map(v => (row.inputs[v] ? v : `${v}'`))
          .join('');
        minterms.push(term);
      }
    }

    return minterms.length > 0 ? minterms.join(' + ') : '0';
  }

  toCanonicalPos(): string {
    const table = this.generateTruthTable();
    const maxterms: string[] = [];

    for (const row of table.rows) {
      if (!row.output) {
        const term = table.variables
          .map(v => (row.inputs[v] ? `${v}'` : v))
          .join(' + ');
        maxterms.push(`(${term})`);
      }
    }

    return maxterms.length > 0 ? maxterms.join('') : '1';
  }
}

class Parser {
  private readonly input: string;
  pos: number = 0;

  constructor(input: string) {
    this.input = input;
  }

  private peek(): string | null {
    return this.pos < this.input.length ? this.input[this.pos] : null;
  }

  private get(): string {
    return this.input[this.pos++];
  }

  parseExpr(): AstNode {
    return this.parseOr();
  }

  private parseOr(): AstNode {
    let node = this.parseAnd();
    while (this.peek() === '+') {
      this.get(); // consume '+'
      const right = this.parseAnd();
      node = { kind: 'or', a: node, b: right };
    }
    return node;
  }

  private parseAnd(): AstNode {
    let node = this.parseUnary();
    // In juxtaposition, next token can be a variable, '(', or '!'/'~'
    while (this.peek() !== null && this.peek() !== '+' && this.peek() !== ')') {
      const right = this.parseUnary();
      node = { kind: 'and', a: node, b: right };
    }
    return node;
  }

  private parseUnary(): AstNode {
    const ch = this.peek();
    if (ch === '!' || ch === '~') {
      this.get();
      const inner = this.parseUnary();
      return { kind: 'not', inner };
    }

    let node = this.parsePrimary();

    // Check for postfix apostrophe negation: A' or (A+B)'
    while (this.peek() === "'") {
      this.get();
      node = { kind: 'not', inner: node };
    }

    return node;
  }

  private parsePrimary(): AstNode {
    const ch = this.peek();
    if (!ch) {
      throw new Error('Unexpected end of expression.');
    }

    if (ch === '(') {
      this.get();
      const node = this.parseOr();
      if (this.peek() !== ')') {
        throw new Error("Missing closing parenthesis ')'.");
      }
      this.get(); // consume ')'
      return node;
    }

    if (/^[A-Za-z]$/.test(ch)) {
      this.get();
      return { kind: 'var', name: ch.toUpperCase() };
    }

    throw new Error(`Unexpected character '${ch}' at index ${this.pos}.`);
  }
}
