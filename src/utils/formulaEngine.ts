import type { Bond, FilterGroup, FilterCondition, FilterNode, FilterOperator } from '../types/bond';

function evalCondition(bond: Bond, cond: FilterCondition): boolean {
  const raw = bond[cond.field];
  const val = cond.value;
  const op = cond.operator as FilterOperator;

  if (op === 'is-true') return raw === true || raw === 'true';
  if (op === 'is-false') return raw === false || raw === 'false';

  const strRaw = String(raw ?? '').toLowerCase();
  const numRaw = typeof raw === 'number' ? raw : parseFloat(String(raw));

  switch (op) {
    case '=': return strRaw === val.toLowerCase();
    case '!=': return strRaw !== val.toLowerCase();
    case 'contains': return strRaw.includes(val.toLowerCase());
    case 'starts-with': return strRaw.startsWith(val.toLowerCase());
    case 'in': {
      const items = val.split(',').map(s => s.trim().toLowerCase());
      return items.includes(strRaw);
    }
    case '>': return !isNaN(numRaw) && numRaw > parseFloat(val);
    case '>=': return !isNaN(numRaw) && numRaw >= parseFloat(val);
    case '<': return !isNaN(numRaw) && numRaw < parseFloat(val);
    case '<=': return !isNaN(numRaw) && numRaw <= parseFloat(val);
    case 'between': {
      const [lo, hi] = [parseFloat(val), parseFloat(cond.value2 ?? '0')];
      return !isNaN(numRaw) && numRaw >= lo && numRaw <= hi;
    }
    case 'before': return strRaw < val;
    case 'after': return strRaw > val;
    default: return true;
  }
}

function evalNode(bond: Bond, node: FilterNode): boolean {
  if (node.type === 'condition') return evalCondition(bond, node as FilterCondition);
  const group = node as FilterGroup;
  if (group.children.length === 0) return true;
  if (group.logic === 'AND') return group.children.every(c => evalNode(bond, c));
  return group.children.some(c => evalNode(bond, c));
}

export function applyFilters(bonds: Bond[], tree: FilterGroup | null): Bond[] {
  if (!tree || tree.children.length === 0) return bonds;
  return bonds.filter(b => evalNode(b, tree));
}

export function mergeFilterTrees(trees: FilterGroup[]): FilterGroup {
  const valid = trees.filter(t => t.children.length > 0);
  if (valid.length === 0) return { id: 'root', type: 'group', logic: 'AND', children: [] };
  if (valid.length === 1) return valid[0];
  return {
    id: 'merged',
    type: 'group',
    logic: 'AND',
    children: valid,
  };
}
