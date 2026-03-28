// import "server-only";

type RawMandiRecord = Record<string, string | number | null | undefined>;

export type MandiMarketRecord = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
};

export type ListingMandiComparison = {
  commodityQuery: string;
  status: "live" | "fallback" | "unavailable";
  comparisonLabel: string;
  marketName: string;
  district: string;
  state: string;
  arrivalDate: string;
  priceBasisLabel: string;
  appPricePerKg: number;
  mandiPricePerKg: number;
  mandiMinPerKg: number;
  mandiMaxPerKg: number;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  priceGap: number;
  priceGapPercent: number;
  buyerSavingsPerKg: number;
  buyerSavingsPercent: number;
  buyerBenefitLabel: string;
  insight: string;
};

const mandiApiBase =
  process.env.MANDI_API_BASE_URL ?? "https://api.data.gov.in/resource";
const mandiApiKey = process.env.MANDI_API_KEY;
const mandiResourceId =
  process.env.MANDI_RESOURCE_ID ?? "9ef84268-d588-465a-a308-a864a43d0070";

const fallbackPriceMap: Record<string, number> = {
  tomato: 46,
  spinach: 30,
  mango: 125,
  onion: 32,
  potato: 28,
  okra: 41,
  brinjal: 37,
  cabbage: 24,
};

const commodityAliases: Record<string, string[]> = {
  tomato: ["Tomato", "Tomato Hybrid", "Tomato(Local)", "Vine Tomatoes"],
  spinach: ["Spinach", "Palak", "Baby Spinach"],
  mango: ["Mango", "Alphonso", "Alphonso Mangoes"],
  onion: ["Onion"],
  potato: ["Potato"],
  okra: ["Bhindi", "Ladies Finger", "Okra"],
  brinjal: ["Brinjal"],
  cabbage: ["Cabbage"],
};

function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function parseLocationParts(location: string) {
  const [district = "", state = ""] = location.split(",").map((part) => part.trim());
  return { district, state };
}

function inferCommodityKey(title: string, category: string) {
  const normalizedTitle = normalizeToken(title);
  const normalizedCategory = normalizeToken(category);

  for (const [key, aliases] of Object.entries(commodityAliases)) {
    if (
      aliases.some((alias) => normalizedTitle.includes(normalizeToken(alias))) ||
      normalizedTitle.includes(key) ||
      normalizedCategory.includes(key)
    ) {
      return key;
    }
  }

  return normalizedTitle || normalizedCategory || "produce";
}

function getCommodityQueries(title: string, category: string) {
  const key = inferCommodityKey(title, category);
  const aliases = commodityAliases[key] ?? [title];
  const uniqueAliases = [...new Set([aliases[0] ?? title, title, ...aliases])];
  return {
    key,
    queries: uniqueAliases.filter(Boolean),
  };
}

function toNumber(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const parsed = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function readField(record: RawMandiRecord, candidates: string[]) {
  for (const candidate of candidates) {
    const direct = record[candidate];
    if (direct !== undefined && direct !== null && String(direct).trim()) {
      return String(direct).trim();
    }
    const looseKey = Object.keys(record).find((key) => normalizeToken(key) === normalizeToken(candidate));
    if (looseKey) {
      const looseValue = record[looseKey];
      if (looseValue !== undefined && looseValue !== null && String(looseValue).trim()) {
        return String(looseValue).trim();
      }
    }
  }
  return "";
}

function parseMandiRecord(record: RawMandiRecord): MandiMarketRecord | null {
  const commodity = readField(record, ["commodity", "Commodity"]);
  const market = readField(record, ["market", "Market"]);
  const state = readField(record, ["state", "State"]);
  const district = readField(record, ["district", "District"]);

  if (!commodity || !market || !state) {
    return null;
  }

  return {
    commodity,
    market,
    state,
    district,
    variety: readField(record, ["variety", "Variety"]),
    arrivalDate: readField(record, ["arrival_date", "Arrival_Date", "arrivalDate"]),
    minPrice: toNumber(readField(record, ["min_price", "Min_Price", "minPrice"])),
    maxPrice: toNumber(readField(record, ["max_price", "Max_Price", "maxPrice"])),
    modalPrice: toNumber(readField(record, ["modal_price", "Modal_Price", "modalPrice"])),
  };
}

function pickClosestMarket(records: MandiMarketRecord[], location: string) {
  const { district, state } = parseLocationParts(location);
  const normalizedDistrict = normalizeToken(district);
  const normalizedState = normalizeToken(state);

  return (
    records.find((record) => normalizeToken(record.district) === normalizedDistrict) ??
    records.find((record) => normalizeToken(record.state) === normalizedState) ??
    records[0] ??
    null
  );
}

function normalizePricePerKg(price: number, unit: string) {
  const normalizedUnit = unit.trim().toLowerCase();

  if (!price || price <= 0) {
    return 0;
  }

  if (normalizedUnit === "kg" || normalizedUnit === "kilogram") {
    return price;
  }

  if (
    normalizedUnit === "quintal" ||
    normalizedUnit === "qtl" ||
    normalizedUnit === "qtl."
  ) {
    return price / 100;
  }

  if (normalizedUnit === "g" || normalizedUnit === "gram" || normalizedUnit === "grams") {
    return price * 1000;
  }

  return price;
}

function buildComparison(
  record: MandiMarketRecord | null,
  productPrice: number,
  unit: string,
  commodityQuery: string,
  fallbackPrice?: number,
): ListingMandiComparison {
  const livePrice = record?.modalPrice && record.modalPrice > 0 ? record.modalPrice : 0;
  const comparisonPrice = livePrice || fallbackPrice || 0;
  const appPricePerKg = normalizePricePerKg(productPrice, unit);
  const mandiPricePerKg = livePrice
    ? Number((livePrice / 100).toFixed(2))
    : Number((fallbackPrice || 0).toFixed(2));
  const mandiMinPerKg = record?.minPrice
    ? Number((record.minPrice / 100).toFixed(2))
    : mandiPricePerKg;
  const mandiMaxPerKg = record?.maxPrice
    ? Number((record.maxPrice / 100).toFixed(2))
    : mandiPricePerKg;
  const priceGap = Number((appPricePerKg - mandiPricePerKg).toFixed(2));
  const priceGapPercent =
    mandiPricePerKg > 0 ? Number(((priceGap / mandiPricePerKg) * 100).toFixed(1)) : 0;
  const buyerSavingsPerKg = Number((mandiPricePerKg - appPricePerKg).toFixed(2));
  const buyerSavingsPercent =
    mandiPricePerKg > 0
      ? Number(((buyerSavingsPerKg / mandiPricePerKg) * 100).toFixed(1))
      : 0;
  const direction =
    priceGap < 0 ? "below" : priceGap > 0 ? "above" : "in line with";

  const status: ListingMandiComparison["status"] = livePrice
    ? "live"
    : fallbackPrice
      ? "fallback"
      : "unavailable";

  const marketName = record?.market || "Market benchmark";
  const district = record?.district || "Local district";
  const state = record?.state || "India";
  const arrivalDate = record?.arrivalDate || "Recent benchmark";
  const buyerBenefitLabel =
    buyerSavingsPerKg > 0
      ? "Buyer is saving on the app"
      : buyerSavingsPerKg < 0
        ? "App price is above mandi"
        : "App price matches mandi";

  let insight = `Direct farm price is ${direction} local mandi benchmark by Rs. ${Math.abs(priceGap)}/kg.`;
  if (priceGap < 0) {
    insight = `Buyer saves around Rs. ${Math.abs(priceGap)}/kg on the app compared with local mandi pricing.`;
  } else if (priceGap > 0) {
    insight = `App listing is Rs. ${priceGap}/kg above mandi, which may reflect freshness, delivery, or direct farm quality.`;
  }

  return {
    commodityQuery,
    status,
    comparisonLabel:
      status === "live"
        ? "Live mandi"
        : status === "fallback"
          ? "Fallback benchmark"
          : "Mandi data unavailable",
    marketName,
    district,
    state,
    arrivalDate,
    priceBasisLabel: "Per kg comparison",
    appPricePerKg,
    mandiPricePerKg,
    mandiMinPerKg,
    mandiMaxPerKg,
    modalPrice: comparisonPrice,
    minPrice: record?.minPrice || comparisonPrice,
    maxPrice: record?.maxPrice || comparisonPrice,
    priceGap,
    priceGapPercent,
    buyerSavingsPerKg,
    buyerSavingsPercent,
    buyerBenefitLabel,
    insight,
  };
}

async function fetchCommodityRecords(query: string): Promise<MandiMarketRecord[]> {
  if (!mandiApiKey) {
    return [];
  }

  const params = new URLSearchParams({
    "api-key": mandiApiKey,
    format: "json",
    limit: "20",
    "filters[commodity]": query,
  });

  const response = await fetch(`${mandiApiBase}/${mandiResourceId}?${params.toString()}`, {
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!response.ok) {
    throw new Error(`MANDI_API_${response.status}`);
  }

  const payload = (await response.json()) as {
    records?: RawMandiRecord[];
  };

  return (payload.records ?? [])
    .map((record) => parseMandiRecord(record))
    .filter((record): record is MandiMarketRecord => record !== null);
}

export async function getMandiComparisonForListing(input: {
  title: string;
  category: string;
  location: string;
  price: number;
  unit: string;
}) {
  const { key, queries } = getCommodityQueries(input.title, input.category);
  const fallbackPrice = fallbackPriceMap[key];

  for (const query of queries) {
    try {
      const records = await fetchCommodityRecords(query);
      if (records.length > 0) {
        const nearest = pickClosestMarket(records, input.location);
        return buildComparison(nearest, input.price, input.unit, query, fallbackPrice);
      }
    } catch {
      break;
    }
  }

  return buildComparison(null, input.price, input.unit, queries[0] ?? input.title, fallbackPrice);
}
