import type { Bond, BondType, Rating, Liquidity } from '../types/bond';

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const rng = seededRng(42);
const r = () => rng();
const pick = <T>(arr: T[]) => arr[Math.floor(r() * arr.length)];
const rand = (min: number, max: number, dp = 2) =>
  parseFloat((min + r() * (max - min)).toFixed(dp));
const randInt = (min: number, max: number) => Math.floor(min + r() * (max - min + 1));

const bondTypeConfigs: Record<BondType, {
  issuers: string[];
  ratings: Rating[];
  benchmarks: string[];
  collateral: string[];
  tranches: string[];
  sectors: string[];
  currencies: string[];
  countries: string[];
  cusipPrefix: string;
}> = {
  'Agency CMO': {
    issuers: ['Fannie Mae', 'Freddie Mac', 'Ginnie Mae'],
    ratings: ['AAA'],
    benchmarks: ['UST 2Y', 'UST 5Y', 'UST 10Y', 'LIBOR 1M', 'SOFR 3M'],
    collateral: ['30yr FN', '15yr FN', 'FH Gold', 'GN II', '30yr FH'],
    tranches: ['SEQ A', 'PAC A1', 'PAC A2', 'TAC A', 'IO', 'PO', 'Z', 'PAC B', 'SUP'],
    sectors: ['Agency'],
    currencies: ['USD'],
    countries: ['US'],
    cusipPrefix: '31',
  },
  'Non-Agency CMO': {
    issuers: ['Bear Stearns', 'Countrywide', 'WaMu', 'IndyMac', 'JPM Chase', 'Citigroup', 'BSABS', 'CWABS'],
    ratings: ['AAA', 'AA+', 'AA', 'A+', 'A', 'BBB+', 'BBB', 'BB', 'B', 'CCC', 'NR'],
    benchmarks: ['UST 2Y', 'UST 5Y', 'LIBOR 1M', 'SOFR 1M', 'SOFR 3M'],
    collateral: ['Prime Jumbo', 'Alt-A', 'Subprime', 'Option ARM', 'HELOC'],
    tranches: ['A1', 'A2', 'A3', 'A4', 'A5', 'M1', 'M2', 'M3', 'B1', 'B2', 'B3', 'CE', 'IO'],
    sectors: ['Non-Agency'],
    currencies: ['USD'],
    countries: ['US'],
    cusipPrefix: '07',
  },
  'Spec Pool': {
    issuers: ['Fannie Mae', 'Freddie Mac', 'Ginnie Mae'],
    ratings: ['AAA'],
    benchmarks: ['UST 10Y', 'UST 30Y', 'MBS Current Coupon'],
    collateral: ['30yr FN', '15yr FN', 'FH Gold', 'GN I', 'GN II', '20yr FN'],
    tranches: ['TBA', 'Specified', 'Loan Balance', 'FICO', 'LTV', 'Geographic'],
    sectors: ['Agency MBS'],
    currencies: ['USD'],
    countries: ['US'],
    cusipPrefix: '3138',
  },
  CMBS: {
    issuers: ['JPMCC', 'GSMS', 'WFCM', 'CGCMT', 'COMM', 'BANK', 'BBCMS', 'BMARK', 'MSC', 'LBUBS'],
    ratings: ['AAA', 'AA', 'A', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'B+', 'B', 'CCC', 'NR'],
    benchmarks: ['UST 5Y', 'UST 10Y', 'SOFR 1M', 'SOFR 3M', 'LIBOR 1M'],
    collateral: ['Conduit', 'Large Loan', 'Single Asset', 'Floater', 'IO Strip'],
    tranches: ['AAA', 'AS', 'B', 'C', 'D', 'E', 'F', 'G', 'X-A', 'X-B', 'V1', 'RR'],
    sectors: ['CMBS'],
    currencies: ['USD', 'EUR'],
    countries: ['US'],
    cusipPrefix: '46',
  },
  ABS: {
    issuers: ['Ford ABS', 'GM Financial', 'Toyota ABS', 'Ally ABS', 'AmeriCredit', 'Capital One', 'Discover', 'Sallie Mae', 'Navient'],
    ratings: ['AAA', 'AA', 'AA-', 'A+', 'A', 'BBB+', 'BBB', 'BB', 'B'],
    benchmarks: ['SOFR 1M', 'SOFR 3M', 'UST 2Y', 'UST 3Y', 'UST 5Y'],
    collateral: ['Auto Loan', 'Auto Lease', 'Credit Card', 'Student Loan', 'Equipment', 'Whole Business'],
    tranches: ['A-1', 'A-2', 'A-3', 'A-4', 'B', 'C', 'D', 'E'],
    sectors: ['ABS'],
    currencies: ['USD', 'EUR', 'GBP'],
    countries: ['US', 'UK'],
    cusipPrefix: '34',
  },
  SBA: {
    issuers: ['SBA', 'US SBA Debentures'],
    ratings: ['AAA'],
    benchmarks: ['UST 10Y', 'UST 25Y', 'Prime Rate'],
    collateral: ['7(a) Pool', '504 Pool', 'SBIC Debenture'],
    tranches: ['Pool', 'CTF'],
    sectors: ['Government'],
    currencies: ['USD'],
    countries: ['US'],
    cusipPrefix: '83162C',
  },
  'CDO/CLO': {
    issuers: ['Blackstone', 'KKR', 'Apollo', 'Carlyle', 'Ares', 'PIMCO', 'Oak Hill', 'Benefit Street', 'Madison Park', 'Wellfleet'],
    ratings: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'NR'],
    benchmarks: ['SOFR 3M', 'LIBOR 3M', 'SOFR 1M'],
    collateral: ['Leveraged Loans', 'Corporate Bonds', 'Trust Preferred', 'ABS CDO', 'CLO 2.0', 'Middle Market Loans'],
    tranches: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'Sub / Equity'],
    sectors: ['Structured Credit'],
    currencies: ['USD', 'EUR'],
    countries: ['US', 'IE', 'NL'],
    cusipPrefix: '55',
  },
  Euro: {
    issuers: ['Deutsche Bank', 'BNP Paribas', 'Société Générale', 'UniCredit', 'Intesa', 'Santander', 'BBVA', 'ING', 'Rabobank', 'Crédit Agricole'],
    ratings: ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-'],
    benchmarks: ['EUR SWAP 5Y', 'EUR SWAP 10Y', 'EURIBOR 3M', 'EURIBOR 6M', 'Bund 5Y', 'Bund 10Y'],
    collateral: ['RMBS', 'ABS Auto', 'CMBS', 'SME', 'Consumer', 'Covered Bond'],
    tranches: ['A', 'B', 'C', 'D', 'Junior', 'Senior', 'Mezzanine'],
    sectors: ['Euro ABS', 'Euro RMBS', 'Covered Bond'],
    currencies: ['EUR', 'GBP', 'CHF'],
    countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'GB', 'IE', 'PT'],
    cusipPrefix: 'EU',
  },
};

const bondTypes: BondType[] = ['Agency CMO', 'Non-Agency CMO', 'Spec Pool', 'CMBS', 'ABS', 'SBA', 'CDO/CLO', 'Euro'];

function generateCusip(bondType: BondType, idx: number): string {
  const cfg = bondTypeConfigs[bondType];
  const base = cfg.cusipPrefix;
  const num = String(idx).padStart(9 - base.length, '0');
  return (base + num).substring(0, 9).toUpperCase();
}

function generateIsin(cusip: string, country: string): string {
  return `${country}${cusip}0`;
}

function generateTicker(_bondType: BondType, issuer: string, idx: number): string {
  const initials = issuer.split(/\s+/).map(w => w[0]).join('').substring(0, 4);
  return `${initials}${String(idx).padStart(3, '0')}`;
}

function generateDescription(bondType: BondType, issuer: string, tranche: string, coupon: number, matYear: number): string {
  const couponStr = coupon.toFixed(2) + '%';
  const abbr: Record<BondType, string> = {
    'Agency CMO': 'CMO',
    'Non-Agency CMO': 'REMIC',
    'Spec Pool': 'MBS',
    CMBS: 'CMBS',
    ABS: 'ABS',
    SBA: 'SBA',
    'CDO/CLO': 'CLO',
    Euro: 'ABS',
  };
  return `${issuer.split(' ')[0]} ${abbr[bondType]} ${matYear} ${tranche} ${couponStr}`;
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function generateMockData(count = 500): Bond[] {
  const bonds: Bond[] = [];
  const typeCount = bondTypes.length;

  for (let i = 0; i < count; i++) {
    const bondType = bondTypes[i % typeCount];
    const cfg = bondTypeConfigs[bondType];

    const issuer = pick(cfg.issuers);
    const rating = pick(cfg.ratings) as Rating;
    const benchmark = pick(cfg.benchmarks);
    const collateralType = pick(cfg.collateral);
    const trancheClass = pick(cfg.tranches);
    const sector = pick(cfg.sectors);
    const currency = pick(cfg.currencies);
    const country = pick(cfg.countries);

    const coupon = rand(0, 8, 3);
    const issueYear = randInt(2000, 2023);
    const issueMonth = randInt(1, 12);
    const maturityYear = issueYear + randInt(3, 30);
    const maturityMonth = randInt(1, 12);
    const settlementYear = 2024;
    const settlementMonth = randInt(1, 12);

    const originalFace = randInt(1, 500) * 1_000_000;
    const factor = rand(0.05, 1.0, 6);
    const currentFace = parseFloat((originalFace * factor).toFixed(0));

    const isHighYield = ['BB+', 'BB', 'BB-', 'B+', 'B', 'B-', 'CCC', 'CC', 'C', 'D'].includes(rating);
    const spread = isHighYield ? rand(200, 1500, 1) : rand(10, 350, 1);
    const zSpread = spread + rand(-20, 20, 1);
    const price = rand(isHighYield ? 50 : 75, 108, 3);
    const ytm = coupon + spread / 100 + rand(-0.5, 0.5, 3);
    const ytw = ytm - rand(0, 0.3, 3);
    const oasDuration = rand(0.5, 12, 2);
    const modDuration = oasDuration + rand(-0.5, 0.5, 2);
    const convexity = rand(-5, 10, 3);
    const dv01 = parseFloat((modDuration * currentFace * price / 100 / 10000).toFixed(2));
    const wac = coupon + rand(0, 2, 3);
    const wam = randInt(12, 360);
    const wal = rand(0.5, 15, 2);
    const prepaySpeed = rand(0, 50, 1);
    const callable = r() > 0.6;
    const callYear = callable ? issueYear + randInt(1, 5) : null;
    const liquidity: Liquidity = r() > 0.6 ? 'High' : r() > 0.4 ? 'Medium' : 'Low';
    const priceChange1d = rand(-2, 2, 3);
    const spreadChange1d = rand(-20, 20, 1);
    const accrualBasis = pick(['30/360', 'Act/360', 'Act/365', 'Act/Act']);
    const payFrequency = pick(['Monthly', 'Quarterly', 'Semi-Annual', 'Annual']);

    const cusip = generateCusip(bondType, i + 1000);
    const isin = generateIsin(cusip, country);
    const ticker = generateTicker(bondType, issuer, i);

    bonds.push({
      id: String(i + 1),
      cusip,
      isin,
      ticker: ticker.toUpperCase(),
      description: generateDescription(bondType, issuer, trancheClass, coupon, maturityYear),
      bondType,
      issuer,
      rating,
      originalFace,
      currentFace,
      factor,
      coupon,
      price,
      yieldToMaturity: Math.max(0, ytm),
      yieldToWorst: Math.max(0, ytw),
      spread,
      benchmark,
      zSpread,
      oasDuration,
      modifiedDuration: Math.max(0, modDuration),
      convexity,
      dv01,
      wac,
      wam,
      wal,
      prepaySpeed,
      settlementDate: formatDate(settlementYear, settlementMonth, randInt(1, 28)),
      maturityDate: formatDate(maturityYear, maturityMonth, randInt(1, 28)),
      issueDate: formatDate(issueYear, issueMonth, randInt(1, 28)),
      sector,
      collateralType,
      trancheClass,
      currency,
      country,
      accrualBasis,
      payFrequency,
      callable,
      callDate: callYear ? formatDate(callYear, randInt(1, 12), randInt(1, 28)) : null,
      liquidity,
      priceChange1d,
      spreadChange1d,
    });
  }

  return bonds;
}

export const MOCK_DATA: Bond[] = generateMockData(500);
