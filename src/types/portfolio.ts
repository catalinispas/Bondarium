export interface PortfolioPosition {
  id: string;
  bondId: string;
  notional: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  createdAt: string;
  positions: PortfolioPosition[];
}
