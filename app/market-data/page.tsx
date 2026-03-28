import Link from "next/link";
import {
  getCedaCommodities,
  getCedaPrices,
  getCedaQuantities,
  getCedaStates,
} from "@/lib/ceda";

type SearchParams = Promise<{
  commodity?: string | string[];
  state?: string | string[];
  range?: string | string[];
}>;

type DateWindow = {
  startDate: string;
  endDate: string;
};

type PriceData = {
  t: string;
  p_modal: number;
  p_min: number;
  p_max: number;
};

type QuantityData = {
  t: string;
  cmdty: string;
  qty: number;
};

function readParam(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  return value ?? fallback;
}

function formatNumber(value: number | undefined) {
  if (typeof value !== "number") {
    return "N/A";
  }
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompactNumber(value: number | undefined) {
  if (typeof value !== "number") {
    return "N/A";
  }
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatIndianNumber(value: number | undefined) {
  if (typeof value !== "number") {
    return "N/A";
  }
  // Indian number formatting (lakhs, crores)
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `${(value / 100000).toFixed(2)} Lakh`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toString();
}

function sortLatestFirst<T extends { t: string }>(items: T[]) {
  return [...items].sort((left, right) => right.t.localeCompare(left.t));
}

function getRangeDays(range: string) {
  if (range === "30d") return 30;
  if (range === "180d") return 180;
  return 90;
}

function buildDateWindow(endDate: Date, days: number): DateWindow {
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - days);
  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}

function getCandidateDateWindows(range: string) {
  const days = getRangeDays(range);
  const now = new Date();
  return [
    buildDateWindow(now, days),
    buildDateWindow(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()), days),
    buildDateWindow(new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()), days),
    buildDateWindow(new Date("2025-09-09"), days),
    buildDateWindow(new Date("2025-03-01"), days),
  ];
}

async function loadMarketData(input: {
  commodityId: number;
  stateId: number;
  range: string;
}) {
  const windows = getCandidateDateWindows(input.range);

  for (const window of windows) {
    const [prices, quantities] = await Promise.all([
      getCedaPrices({
        commodityId: input.commodityId,
        stateId: input.stateId,
        districtId: 0,
        calculationType: "m",
        startDate: window.startDate,
        endDate: window.endDate,
      }),
      getCedaQuantities({
        commodityId: input.commodityId,
        stateId: input.stateId,
        districtId: 0,
        calculationType: "m",
        startDate: window.startDate,
        endDate: window.endDate,
      }),
    ]);

    if (prices.length > 0 || quantities.length > 0) {
      return {
        prices,
        quantities,
        resolvedWindow: window,
      };
    }
  }

  return {
    prices: [],
    quantities: [],
    resolvedWindow: windows[0],
  };
}

function calculateTrend(data: number[]) {
  if (data.length < 2) return { direction: 'stable', percentage: 0 };
  const first = data[0];
  const last = data[data.length - 1];
  const change = ((last - first) / first) * 100;
  return {
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    percentage: Math.abs(change).toFixed(1),
  };
}

// Simple bar chart for prices - easy to understand
function SimplePriceBarChart({ prices }: { prices: PriceData[] }) {
  if (prices.length === 0) return null;
  
  const sortedPrices = sortLatestFirst(prices).reverse();
  const maxPrice = Math.max(...sortedPrices.map(p => p.p_max));
  const modalPrices = sortedPrices.map(p => p.p_modal);
  const trend = calculateTrend(modalPrices);
  
  // Find best and worst prices
  const bestPrice = Math.max(...modalPrices);
  const worstPrice = Math.min(...modalPrices);
  const latestPrice = modalPrices[modalPrices.length - 1];
  const bestPriceDate = sortedPrices[modalPrices.indexOf(bestPrice)].t;
  
  return (
    <div className="mt-6">
      {/* Simple trend message */}
      <div className={`mb-6 p-4 rounded-lg ${trend.direction === 'up' ? 'bg-green-50 border border-green-200' : trend.direction === 'down' ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">
            {trend.direction === 'up' && '📈'}
            {trend.direction === 'down' && '📉'}
            {trend.direction === 'stable' && '➡️'}
          </span>
          <div>
            <p className="font-semibold text-gray-900">
              {trend.direction === 'up' && 'Prices are Going Up!'}
              {trend.direction === 'down' && 'Prices are Going Down'}
              {trend.direction === 'stable' && 'Prices are Stable'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {trend.direction === 'up' && 'Good time to sell your crop. Prices increased by '}
              {trend.direction === 'down' && 'Consider waiting a few days. Prices decreased by '}
              {trend.direction === 'stable' && 'Prices are steady. '}
              {trend.percentage > 0 && `${trend.percentage}% over ${sortedPrices.length} days`}
            </p>
          </div>
        </div>
      </div>
      
      {/* Simple bar chart */}
      <div className="space-y-3">
        {sortedPrices.slice(-12).map((price, idx) => {
          const heightPercent = (price.p_modal / maxPrice) * 100;
          const isBest = price.p_modal === bestPrice;
          const isWorst = price.p_modal === worstPrice;
          const isLatest = idx === sortedPrices.slice(-12).length - 1;
          
          return (
            <div key={idx} className="group">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">
                  {new Date(price.t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {isLatest && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Latest</span>}
                </span>
                <span className="font-semibold text-gray-900">
                  ₹{formatNumber(price.p_modal)}/quintal
                </span>
              </div>
              <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-300 rounded-lg ${
                    isBest ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                    isWorst ? 'bg-gradient-to-r from-red-400 to-red-500' : 
                    'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  }`}
                  style={{ width: `${heightPercent}%` }}
                >
                  {isBest && heightPercent > 30 && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold">
                      Best Price! ⭐
                    </div>
                  )}
                  {isWorst && heightPercent > 30 && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold">
                      Lowest
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Quick summary cards */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-600 mb-1">Best Price</p>
          <p className="text-lg font-bold text-green-700">₹{formatNumber(bestPrice)}</p>
          <p className="text-xs text-gray-500">{new Date(bestPriceDate).toLocaleDateString()}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-600 mb-1">Today's Price</p>
          <p className="text-lg font-bold text-blue-700">₹{formatNumber(latestPrice)}</p>
          <p className="text-xs text-gray-500">per quintal</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-600 mb-1">Change</p>
          <p className={`text-lg font-bold ${trend.direction === 'up' ? 'text-green-600' : trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.percentage}%
          </p>
          <p className="text-xs text-gray-500">vs start</p>
        </div>
      </div>
    </div>
  );
}

// Simple bar chart for quantity - shows market supply
function SimpleQuantityBarChart({ quantities }: { quantities: QuantityData[] }) {
  if (quantities.length === 0) return null;
  
  const sortedQuantities = sortLatestFirst(quantities).reverse().slice(-12);
  const maxQty = Math.max(...sortedQuantities.map(q => q.qty));
  const totalQty = quantities.reduce((sum, q) => sum + q.qty, 0);
  const avgQty = totalQty / quantities.length;
  
  // Determine supply level
  const latestQty = sortedQuantities[sortedQuantities.length - 1]?.qty || 0;
  const supplyLevel = latestQty > avgQty ? 'High' : latestQty < avgQty ? 'Low' : 'Normal';
  const supplyColor = supplyLevel === 'High' ? 'text-orange-600' : supplyLevel === 'Low' ? 'text-green-600' : 'text-blue-600';
  
  return (
    <div className="mt-6">
      {/* Supply insight */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🚜</span>
          <div>
            <p className="font-semibold text-gray-900">
              Market Supply: {supplyLevel}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {supplyLevel === 'High' && 'More crop is arriving in market. Prices may decrease.'}
              {supplyLevel === 'Low' && 'Less crop in market. Good time to sell for better prices.'}
              {supplyLevel === 'Normal' && 'Normal supply in market. Prices are stable.'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Simple bar chart for quantity */}
      <div className="space-y-3">
        {sortedQuantities.map((item, idx) => {
          const heightPercent = (item.qty / maxQty) * 100;
          const isLatest = idx === sortedQuantities.length - 1;
          
          // Convert to sacks (1 quintal = 2 sacks of 50kg)
          const sackCount = Math.floor(item.qty * 2);
          
          return (
            <div key={idx} className="group">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">
                  {new Date(item.t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {isLatest && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Latest</span>}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatIndianNumber(item.qty)} quintals
                </span>
              </div>
              <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-300 rounded-lg"
                  style={{ width: `${heightPercent}%` }}
                >
                  {sackCount > 50 && heightPercent > 40 && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs">
                      {sackCount.toLocaleString()} sacks
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Supply summary */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Total Arrival</p>
          <p className="text-lg font-bold text-gray-900">{formatIndianNumber(totalQty)}</p>
          <p className="text-xs text-gray-500">quintals total</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Daily Average</p>
          <p className="text-lg font-bold text-gray-900">{formatIndianNumber(avgQty)}</p>
          <p className="text-xs text-gray-500">quintals/day</p>
        </div>
      </div>
    </div>
  );
}

// Simple stats card with clear information
function SimpleStatsCard({ title, value, subtitle, icon, color = "gray" }: any) {
  const colors: any = {
    green: "bg-green-50 border-green-200",
    blue: "bg-blue-50 border-blue-200",
    orange: "bg-orange-50 border-orange-200",
    purple: "bg-purple-50 border-purple-200",
    gray: "bg-gray-50 border-gray-200"
  };
  
  return (
    <div className={`${colors[color]} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-gray-500">{subtitle}</span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default async function MarketDataPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const commodities = await getCedaCommodities();
  const states = await getCedaStates();

  const selectedCommodityId = Number(
    readParam(params.commodity, String(commodities[0]?.commodity_id ?? 1)),
  );
  const selectedStateId = Number(readParam(params.state, "0"));
  const range = readParam(params.range, "90d");
  const { prices, quantities, resolvedWindow } = await loadMarketData({
    commodityId: selectedCommodityId,
    stateId: selectedStateId,
    range,
  });

  const selectedCommodity = commodities.find(
    (item) => item.commodity_id === selectedCommodityId,
  );
  const selectedState = states.find(
    (item) => item.census_state_id === selectedStateId,
  );
  const latestPrice = sortLatestFirst(prices)[0];
  const totalArrival = quantities.reduce((sum, q) => sum + q.qty, 0);
  const avgPrice = prices.reduce((sum, p) => sum + p.p_modal, 0) / (prices.length || 1);

  const rangeLabels = {
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '180d': 'Last 180 Days',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">🌾</span>
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                  Farmer Market Dashboard
                </p>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Crop Prices & Market Info
              </h1>
              <p className="mt-2 text-gray-600 text-sm max-w-2xl">
                Check real-time prices before selling. Simple charts help you understand market trends easily.
              </p>
            </div>
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Sidebar Filters */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Options</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="commodity">
                    Crop Name 🌾
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    defaultValue={String(selectedCommodityId)}
                    id="commodity"
                    name="commodity"
                  >
                    {commodities.map((item) => (
                      <option key={item.commodity_id} value={item.commodity_id}>
                        {item.commodity_disp_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="state">
                    State/Market 📍
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    defaultValue={String(selectedStateId)}
                    id="state"
                    name="state"
                  >
                    <option value="0">All India</option>
                    {states.map((item) => (
                      <option key={item.census_state_id} value={item.census_state_id}>
                        {item.census_state_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="range">
                    Time Period 📅
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    defaultValue={range}
                    id="range"
                    name="range"
                  >
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="180d">Last 180 days</option>
                  </select>
                </div>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium" type="submit">
                  Update Data 🔄
                </button>
              </form>

              {/* Commodity List */}
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-2">All Crops</p>
                <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                  {commodities.map((item) => (
                    <div
                      key={item.commodity_id}
                      className={`px-3 py-2 text-sm border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${
                        item.commodity_id === selectedCommodityId
                          ? "bg-green-50 text-green-700 font-medium border-l-4 border-l-green-500"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {item.commodity_disp_name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Market Info Banner */}
            <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedCommodity?.commodity_disp_name ?? "Select Crop"}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedState?.census_state_name ?? "All India"} • {rangeLabels[range as keyof typeof rangeLabels]}
                  </p>
                </div>
                <div className="bg-white rounded-lg px-3 py-1.5 text-center">
                  <p className="text-xs text-gray-500">Data Available</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {prices.length} days
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid - Simple and clear */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <SimpleStatsCard
                title="Today's Price"
                value={`₹${formatNumber(latestPrice?.p_modal)}/qtl`}
                subtitle="per quintal"
                icon="💰"
                color="green"
              />
              <SimpleStatsCard
                title="Best Price"
                value={`₹${formatNumber(Math.max(...prices.map(p => p.p_modal)))}/qtl`}
                subtitle={prices.length > 0 ? `on ${new Date(prices.reduce((a,b) => a.p_modal > b.p_modal ? a : b).t).toLocaleDateString()}` : "N/A"}
                icon="⭐"
                color="orange"
              />
              <SimpleStatsCard
                title="Total Arrival"
                value={formatIndianNumber(totalArrival)}
                subtitle="quintals total"
                icon="🚜"
                color="blue"
              />
              <SimpleStatsCard
                title="Avg Price"
                value={`₹${formatNumber(avgPrice)}/qtl`}
                subtitle="last 90 days"
                icon="📊"
                color="purple"
              />
            </div>

            {/* Price Chart - Simple Bar Chart */}
            {prices.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">📊 Price Trends</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Simple bar chart - taller bars mean higher prices
                    </p>
                  </div>
                </div>
                <SimplePriceBarChart prices={prices} />
              </div>
            )}

            {/* Quantity Chart - Simple Bar Chart */}
            {quantities.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">🚜 Market Arrival</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      More crop arrival = more supply in market
                    </p>
                  </div>
                </div>
                <SimpleQuantityBarChart quantities={quantities} />
              </div>
            )}

            {/* Simple Tables - Easy to read */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Recent Prices</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-3 py-2 text-gray-600">Date</th>
                        <th className="text-right px-3 py-2 text-gray-600">Price (₹/quintal)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortLatestFirst(prices).slice(0, 8).map((item) => (
                        <tr key={item.t} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-700">{new Date(item.t).toLocaleDateString()}</td>
                          <td className="px-3 py-2 text-right font-medium text-green-700">₹{formatNumber(item.p_modal)}</td>
                        </tr>
                      ))}
                      {prices.length === 0 && (
                        <tr>
                          <td colSpan={2} className="px-3 py-4 text-center text-gray-500">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📦 Arrival Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-3 py-2 text-gray-600">Date</th>
                        <th className="text-right px-3 py-2 text-gray-600">Quantity (quintals)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortLatestFirst(quantities).slice(0, 8).map((item) => (
                        <tr key={item.t} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-700">{new Date(item.t).toLocaleDateString()}</td>
                          <td className="px-3 py-2 text-right font-medium text-blue-700">{formatIndianNumber(item.qty)}</td>
                        </tr>
                      ))}
                      {quantities.length === 0 && (
                        <tr>
                          <td colSpan={2} className="px-3 py-4 text-center text-gray-500">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Helpful Tips for Farmers */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tips for Farmers</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>✓ <strong>Prices going up?</strong> - Good time to sell your crop</p>
                    <p>✓ <strong>Prices going down?</strong> - Wait 2-3 days if possible</p>
                    <p>✓ <strong>High arrival?</strong> - More supply means prices may drop</p>
                    <p>✓ <strong>Low arrival?</strong> - Less supply means better prices</p>
                    <p>✓ Compare prices across 2-3 markets before selling</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}