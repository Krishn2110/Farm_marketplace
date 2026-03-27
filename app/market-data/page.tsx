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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12">
      <section className="panel panel-strong">
        <p className="eyebrow text-emerald-700">CEDA Market Data</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
              Commodity list and market prices
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
              This page uses CEDA Agri Market data. Commodity and state lists are
              loaded from the official public endpoints, and protected price and
              quantity data are requested server-side with your CEDA API key.
            </p>
          </div>
          <Link className="btn-secondary" href="/">
            Back to home
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="panel panel-strong">
          <h2 className="text-2xl font-semibold text-stone-950">
            Filters and commodities
          </h2>
          <form className="mt-6 grid gap-4">
            <div>
              <label className="label" htmlFor="commodity">
                Commodity
              </label>
              <select
                className="field mt-2"
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
              <label className="label" htmlFor="state">
                State
              </label>
              <select
                className="field mt-2"
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
              <label className="label" htmlFor="range">
                Range
              </label>
              <select
                className="field mt-2"
                defaultValue={range}
                id="range"
                name="range"
              >
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="180d">Last 180 days</option>
              </select>
            </div>
            <button className="btn-primary mt-2" type="submit">
              Load market data
            </button>
          </form>

          <div className="mt-8">
            <p className="label">All commodities</p>
            <div className="mt-3 max-h-128 overflow-auto rounded-2xl border border-stone-900/8 bg-white">
              <div className="grid divide-y divide-stone-100">
                {commodities.map((item) => (
                  <div
                    key={item.commodity_id}
                    className={`px-4 py-3 text-sm ${
                      item.commodity_id === selectedCommodityId
                        ? "bg-emerald-50 font-semibold text-emerald-900"
                        : "text-stone-700"
                    }`}
                  >
                    {item.commodity_disp_name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <section className="panel panel-strong">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-stone-500">Selected market</p>
                <h2 className="mt-2 text-3xl font-semibold text-stone-950">
                  {selectedCommodity?.commodity_disp_name ?? "Commodity"}
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  {selectedState?.census_state_name ?? "All India"} •{" "}
                  {resolvedWindow.startDate} to {resolvedWindow.endDate}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
                {prices.length} price points • {quantities.length} quantity points
              </div>
            </div>
            <p className="mt-4 text-xs leading-6 text-stone-500">
              If CEDA has no data for the newest requested window, the page
              automatically falls back to the latest earlier window with data.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="panel panel-strong">
              <p className="eyebrow text-stone-500">Latest modal price</p>
              <p className="mt-3 text-3xl font-semibold text-stone-950">
                Rs. {formatNumber(latestPrice?.p_modal)}
              </p>
              <p className="mt-2 text-sm text-stone-600">
                {latestPrice?.t ?? "No period"} • per quintal
              </p>
            </div>
            <div className="panel panel-strong">
              <p className="eyebrow text-stone-500">Latest minimum price</p>
              <p className="mt-3 text-3xl font-semibold text-stone-950">
                Rs. {formatNumber(latestPrice?.p_min)}
              </p>
              <p className="mt-2 text-sm text-stone-600">
                {latestPrice?.t ?? "No period"} • per quintal
              </p>
            </div>
            <div className="panel panel-strong">
              <p className="eyebrow text-stone-500">Latest maximum price</p>
              <p className="mt-3 text-3xl font-semibold text-stone-950">
                Rs. {formatNumber(latestPrice?.p_max)}
              </p>
              <p className="mt-2 text-sm text-stone-600">
                {latestPrice?.t ?? "No period"} • per quintal
              </p>
            </div>
            <div className="panel panel-strong">
              <p className="eyebrow text-stone-500">Latest arrival quantity</p>
              <p className="mt-3 text-3xl font-semibold text-stone-950">
                {formatNumber(latestQuantity?.qty)}
              </p>
              <p className="mt-2 text-sm text-stone-600">
                {latestQuantity?.t ?? "No period"} • reported arrival weight
              </p>
            </div>
          </section>

          <section className="panel panel-strong">
            <h3 className="text-2xl font-semibold text-stone-950">Price data</h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Prices are shown in rupees per quintal so you can compare the
              latest market level quickly.
            </p>
            <div className="mt-5 overflow-auto rounded-2xl border border-stone-900/8 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 font-medium">Modal Price (Rs./quintal)</th>
                    <th className="px-4 py-3 font-medium">Min Price (Rs./quintal)</th>
                    <th className="px-4 py-3 font-medium">Max Price (Rs./quintal)</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((item) => (
                    <tr key={item.t} className="border-t border-stone-100">
                      <td className="px-4 py-3 text-stone-800">{item.t}</td>
                      <td className="px-4 py-3 text-stone-800">
                        Rs. {formatNumber(item.p_modal)}
                      </td>
                      <td className="px-4 py-3 text-stone-800">
                        Rs. {formatNumber(item.p_min)}
                      </td>
                      <td className="px-4 py-3 text-stone-800">
                        Rs. {formatNumber(item.p_max)}
                      </td>
                    </tr>
                  ))}
                  {prices.length === 0 ? (
                    <tr>
                      <td className="px-4 py-5 text-stone-500" colSpan={4}>
                        No price data returned for this filter set.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel panel-strong">
            <h3 className="text-2xl font-semibold text-stone-950">Quantity data</h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Arrival quantity is shown separately so the commodity weight flow
              is easier to understand alongside price movement.
            </p>
            <div className="mt-5 overflow-auto rounded-2xl border border-stone-900/8 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 font-medium">Commodity</th>
                    <th className="px-4 py-3 font-medium">Arrival Quantity / Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {quantities.map((item) => (
                    <tr key={item.t} className="border-t border-stone-100">
                      <td className="px-4 py-3 text-stone-800">{item.t}</td>
                      <td className="px-4 py-3 text-stone-800">{item.cmdty}</td>
                      <td className="px-4 py-3 text-stone-800">
                        {formatNumber(item.qty)}
                      </td>
                    </tr>
                  ))}
                  {quantities.length === 0 ? (
                    <tr>
                      <td className="px-4 py-5 text-stone-500" colSpan={3}>
                        No quantity data returned for this filter set.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}