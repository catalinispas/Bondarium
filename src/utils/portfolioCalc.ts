import type { Bond } from '../types/bond';
import type { Portfolio, PortfolioPosition } from '../types/portfolio';

export function positionMarketValue(pos: PortfolioPosition, bond: Bond): number {
  return pos.notional * (bond.price / 100) * bond.factor;
}

export function positionBookValue(pos: PortfolioPosition, bond: Bond): number {
  return pos.notional * (pos.purchasePrice / 100) * bond.factor;
}

export function positionPnLDollar(pos: PortfolioPosition, bond: Bond): number {
  return positionMarketValue(pos, bond) - positionBookValue(pos, bond);
}

export function positionPnLPct(pos: PortfolioPosition, bond: Bond): number {
  const bv = positionBookValue(pos, bond);
  return bv === 0 ? 0 : (positionPnLDollar(pos, bond) / bv) * 100;
}

export function positionDV01(pos: PortfolioPosition, bond: Bond): number {
  return (pos.notional / 10_000) * bond.dv01;
}

export interface PortfolioSummary {
  totalMarketValue: number;
  totalBookValue: number;
  totalPnLDollar: number;
  totalPnLPct: number;
  totalDV01: number;
  waSpread: number;
  waOasDuration: number;
}

export function portfolioSummary(
  portfolio: Portfolio,
  bondMap: Map<string, Bond>,
): PortfolioSummary {
  let totalMV = 0, totalBV = 0, totalDV01 = 0;
  let spreadNum = 0, durationNum = 0, notionalDenom = 0;

  for (const pos of portfolio.positions) {
    const bond = bondMap.get(pos.bondId);
    if (!bond) continue;
    totalMV += positionMarketValue(pos, bond);
    totalBV += positionBookValue(pos, bond);
    totalDV01 += positionDV01(pos, bond);
    spreadNum += bond.spread * pos.notional;
    durationNum += bond.oasDuration * pos.notional;
    notionalDenom += pos.notional;
  }

  return {
    totalMarketValue: totalMV,
    totalBookValue: totalBV,
    totalPnLDollar: totalMV - totalBV,
    totalPnLPct: totalBV === 0 ? 0 : ((totalMV - totalBV) / totalBV) * 100,
    totalDV01,
    waSpread: notionalDenom === 0 ? 0 : spreadNum / notionalDenom,
    waOasDuration: notionalDenom === 0 ? 0 : durationNum / notionalDenom,
  };
}

export function scenarioPnL(summary: PortfolioSummary, spreadChangeBp: number): number {
  return -summary.totalDV01 * spreadChangeBp;
}

export function allocationBreakdown(
  portfolio: Portfolio,
  bondMap: Map<string, Bond>,
  field: keyof Bond,
): { label: string; notional: number; pct: number }[] {
  const groups = new Map<string, number>();
  let total = 0;
  for (const pos of portfolio.positions) {
    const bond = bondMap.get(pos.bondId);
    if (!bond) continue;
    const key = String(bond[field] ?? 'Other');
    groups.set(key, (groups.get(key) ?? 0) + pos.notional);
    total += pos.notional;
  }
  return Array.from(groups.entries())
    .map(([label, notional]) => ({ label, notional, pct: total === 0 ? 0 : (notional / total) * 100 }))
    .sort((a, b) => b.notional - a.notional);
}
