export type BondType =
  | 'Agency CMO'
  | 'Non-Agency CMO'
  | 'Spec Pool'
  | 'CMBS'
  | 'ABS'
  | 'SBA'
  | 'CDO/CLO'
  | 'Euro';

export type Rating = 'AAA' | 'AA+' | 'AA' | 'AA-' | 'A+' | 'A' | 'A-' | 'BBB+' | 'BBB' | 'BBB-' | 'BB+' | 'BB' | 'BB-' | 'B+' | 'B' | 'B-' | 'CCC' | 'CC' | 'C' | 'D' | 'NR';
export type Liquidity = 'High' | 'Medium' | 'Low';
export type Density = 'compact' | 'comfortable' | 'spacious';

export interface Bond {
  id: string;
  cusip: string;
  isin: string;
  ticker: string;
  description: string;
  bondType: BondType;
  issuer: string;
  rating: Rating;
  originalFace: number;
  currentFace: number;
  factor: number;
  coupon: number;
  price: number;
  yieldToMaturity: number;
  yieldToWorst: number;
  spread: number;
  benchmark: string;
  zSpread: number;
  oasDuration: number;
  modifiedDuration: number;
  convexity: number;
  dv01: number;
  wac: number;
  wam: number;
  wal: number;
  prepaySpeed: number;
  settlementDate: string;
  maturityDate: string;
  issueDate: string;
  sector: string;
  collateralType: string;
  trancheClass: string;
  currency: string;
  country: string;
  accrualBasis: string;
  payFrequency: string;
  callable: boolean;
  callDate: string | null;
  liquidity: Liquidity;
  priceChange1d: number;
  spreadChange1d: number;
}

export type FilterOperator =
  | '='  | '!=' | '>' | '>=' | '<' | '<='
  | 'contains' | 'starts-with' | 'in' | 'between'
  | 'is-true' | 'is-false' | 'before' | 'after';

export interface FilterCondition {
  id: string;
  type: 'condition';
  field: keyof Bond;
  operator: FilterOperator;
  value: string;
  value2?: string;
}

export interface FilterGroup {
  id: string;
  type: 'group';
  logic: 'AND' | 'OR';
  children: (FilterCondition | FilterGroup)[];
}

export type FilterNode = FilterCondition | FilterGroup;

export interface ConditionalRule {
  id: string;
  column: keyof Bond;
  operator: FilterOperator;
  value: string;
  bgColor: string;
  textColor: string;
  label: string;
}

export interface SavedFilter {
  name: string;
  tree: FilterGroup;
  savedAt: string;
}
