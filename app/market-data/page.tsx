import Link from "next/link";
import { 
  ArrowLeft, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  MapPin, 
  Package, 
  DollarSign,
  ChevronDown,
  Info,
  AlertCircle,
  Download,
  Filter,
  Activity,
  PieChart
} from "lucide-react";

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

function sortLatestFirst<T extends { t: string }>(items: T[]) {
  return [...items].sort((left, right) => right.t.localeCompare(left.t));
}

function getRangeDays(range: string) {
  if (range === "30d") {
    return 30;
  }

  if (range === "180d") {
    return 180;
  }

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

  const fallbackWindow = windows[0];

  return {
    prices: [],
    quantities: [],
    resolvedWindow: fallbackWindow,
  };
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
  const latestQuantity = sortLatestFirst(quantities)[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors border border-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to home</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
          
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-emerald-700 mb-4">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                CEDA Market Data
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-gray-900">
                Commodity prices
                <span className="block text-emerald-600">and market insights</span>
              </h1>
              <p className="mt-3 sm:mt-4 max-w-3xl text-sm sm:text-base text-gray-600 leading-relaxed">
                This page uses CEDA Agri Market data. Commodity and state lists are
                loaded from the official public endpoints, and protected price and
                quantity data are requested server-side with your CEDA API key.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 sm:px-6 py-3 sm:py-4 border border-emerald-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                      Data points
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-900">
                      {prices.length + quantities.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
          {/* Left Column - Filters & Commodities */}
          <div className="w-full xl:w-[320px] 2xl:w-[360px] flex-shrink-0 space-y-6">
            {/* Filters Card */}
            <div className="rounded-xl sm:rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Filters & Settings</h2>
                </div>
              </div>
              
              <form className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2" htmlFor="commodity">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                      Commodity
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full rounded-lg sm:rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none truncate"
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
                    <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2" htmlFor="state">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                      State / Region
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full rounded-lg sm:rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none truncate"
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
                    <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2" htmlFor="range">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                      Time Range
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full rounded-lg sm:rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                      defaultValue={range}
                      id="range"
                      name="range"
                    >
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="180d">Last 180 days</option>
                    </select>
                    <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <button 
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all hover:shadow-lg text-sm sm:text-base" 
                  type="submit"
                >
                  Load market data
                </button>
              </form>
            </div>

            {/* Commodities List */}
            <div className="rounded-xl sm:rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                    <h2 className="font-semibold text-gray-900 text-sm sm:text-base">All Commodities</h2>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500">{commodities.length} items</span>
                </div>
              </div>
              
              <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                <div className="divide-y divide-gray-100">
                  {commodities.map((item) => (
                    <div
                      key={item.commodity_id}
                      className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm transition-colors ${
                        item.commodity_id === selectedCommodityId
                          ? "bg-emerald-50 border-l-2 sm:border-l-4 border-emerald-500 font-semibold text-emerald-900"
                          : "text-gray-700 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <span className="line-clamp-2">{item.commodity_disp_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Market Data */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Selected Market Overview */}
            <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-4 sm:p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-emerald-200 uppercase tracking-wide">
                      Selected Market
                    </p>
                    <h2 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold break-words">
                      {selectedCommodity?.commodity_disp_name ?? "Commodity"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-300 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-emerald-200 break-words">
                        {selectedState?.census_state_name ?? "All India"}
                      </p>
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-300 ml-1 sm:ml-2 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-emerald-200">
                        {resolvedWindow.startDate} to {resolvedWindow.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2">
                    <p className="text-[10px] sm:text-xs font-semibold text-emerald-200">Data points</p>
                    <p className="text-xl sm:text-2xl font-bold">{prices.length + quantities.length}</p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 rounded-lg bg-white/5 backdrop-blur-sm p-2 sm:p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] sm:text-xs text-emerald-200">
                      If CEDA has no data for the newest requested window, the page automatically falls back to the latest earlier window with data.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-lg sm:rounded-xl bg-white shadow-lg border border-gray-100 p-3 sm:p-4 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Modal Price
                  </p>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
                  ₹{formatNumber(latestPrice?.p_modal)}
                </p>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-500 truncate">
                  {latestPrice?.t ?? "No period"} • per quintal
                </p>
              </div>
              
              <div className="rounded-lg sm:rounded-xl bg-white shadow-lg border border-gray-100 p-3 sm:p-4 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Min Price
                  </p>
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
                  ₹{formatNumber(latestPrice?.p_min)}
                </p>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-500 truncate">
                  {latestPrice?.t ?? "No period"} • per quintal
                </p>
              </div>
              
              <div className="rounded-lg sm:rounded-xl bg-white shadow-lg border border-gray-100 p-3 sm:p-4 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Max Price
                  </p>
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
                  ₹{formatNumber(latestPrice?.p_max)}
                </p>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-500 truncate">
                  {latestPrice?.t ?? "No period"} • per quintal
                </p>
              </div>
              
              <div className="rounded-lg sm:rounded-xl bg-white shadow-lg border border-gray-100 p-3 sm:p-4 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Arrival Qty
                  </p>
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
                  {formatNumber(latestQuantity?.qty)}
                </p>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-500 truncate">
                  {latestQuantity?.t ?? "No period"}
                </p>
              </div>
            </div>

            {/* Price Data Table */}
            <div className="rounded-xl sm:rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Price Data</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Prices are shown in rupees per quintal
                    </p>
                  </div>
                  {prices.length > 0 && (
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Modal</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Min</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Max</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {prices.map((item, index) => (
                        <tr key={item.t} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                          <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">{item.t}</td>
                          <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-700">₹{formatNumber(item.p_modal)}</td>
                          <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-700">₹{formatNumber(item.p_min)}</td>
                          <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-700">₹{formatNumber(item.p_max)}</td>
                        </tr>
                      ))}
                      {prices.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 sm:px-6 py-8 sm:py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                              <p className="text-xs sm:text-sm text-gray-500">No price data returned for this filter set</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Quantity Data Table */}
            <div className="rounded-xl sm:rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Quantity Data</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Arrival quantity shown separately
                    </p>
                  </div>
                  {quantities.length > 0 && (
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Commodity</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Arrival Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {quantities.map((item, index) => (
                        <tr key={item.t} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                          <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">{item.t}</td>
                          <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-700 break-words max-w-[150px] sm:max-w-none">{item.cmdty}</td>
                          <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-900">{formatNumber(item.qty)}</td>
                        </tr>
                      ))}
                      {quantities.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-3 sm:px-6 py-8 sm:py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                              <p className="text-xs sm:text-sm text-gray-500">No quantity data returned for this filter set</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add global styles for animations and fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        /* Text truncation */
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}