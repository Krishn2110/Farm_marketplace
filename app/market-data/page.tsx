import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  LineChart,
  MapPin,
  Package,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  getCedaCommodities,
  getCedaPrices,
  getCedaQuantities,
  getCedaStates,
} from "@/lib/ceda";
import { getLivePricePrediction } from "@/lib/price-prediction";

type SearchParams = Promise<{
  commodity?: string | string[];
  state?: string | string[];
  range?: string | string[];
}>;

type DateWindow = {
  startDate: string;
  endDate: string;
};

type ChartPoint = {
  label: string;
  value: number;
  tone: "ceda" | "current" | "predicted";
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

function buildPredictionChart(input: {
  cedaModal?: number;
  currentPrice?: number;
  predictedPrice?: number;
}) {
  const points: ChartPoint[] = [];

  if (typeof input.cedaModal === "number") {
    points.push({
      label: "CEDA modal",
      value: input.cedaModal,
      tone: "ceda",
    });
  }

  if (typeof input.currentPrice === "number") {
    points.push({
      label: "Live current",
      value: input.currentPrice,
      tone: "current",
    });
  }

  if (typeof input.predictedPrice === "number") {
    points.push({
      label: "Predicted next",
      value: input.predictedPrice,
      tone: "predicted",
    });
  }

  if (points.length < 2) {
    return null;
  }

  const width = 640;
  const height = 260;
  const left = 54;
  const right = 24;
  const top = 24;
  const bottom = 44;
  const max = Math.max(...points.map((point) => point.value));
  const min = Math.min(...points.map((point) => point.value));
  const spread = max - min || 1;
  const step = points.length === 1 ? 0 : (width - left - right) / (points.length - 1);

  const plotted = points.map((point, index) => {
    const x = left + step * index;
    const y =
      top + ((max - point.value) / spread) * (height - top - bottom);

    return {
      ...point,
      x,
      y,
    };
  });

  const polyline = plotted.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${left},${height - bottom} ${polyline} ${plotted[plotted.length - 1]?.x},${height - bottom}`;

  return {
    points: plotted,
    polyline,
    area,
    width,
    height,
    left,
    right,
    top,
    bottom,
    max,
    min,
  };
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

  const selectedCommodity = commodities.find(
    (item) => item.commodity_id === selectedCommodityId,
  );
  const selectedState = states.find(
    (item) => item.census_state_id === selectedStateId,
  );

  const [{ prices, quantities, resolvedWindow }, prediction] = await Promise.all([
    loadMarketData({
      commodityId: selectedCommodityId,
      stateId: selectedStateId,
      range,
    }),
    getLivePricePrediction({
      commodity: selectedCommodity?.commodity_disp_name,
      state: selectedState?.census_state_name,
    }),
  ]);

  const latestPrice = sortLatestFirst(prices)[0];
  const latestQuantity = sortLatestFirst(quantities)[0];
  const predictionChart =
    prediction.status === "ready"
      ? buildPredictionChart({
          cedaModal: latestPrice?.p_modal,
          currentPrice: prediction.data.current_price,
          predictedPrice: prediction.data.predicted_price,
        })
      : null;

  const isRising = prediction.status === "ready" && prediction.trend === "up";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12">
      <section className="panel panel-strong">
        <p className="eyebrow text-emerald-700">CEDA Market Data</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
              Commodity list, live prediction, and market prices
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
              Selected commodity now shows official CEDA market data plus your live
              price prediction API so rising-price opportunities become easy to spot.
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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow text-stone-500">Selected market</p>
                <h2 className="mt-2 text-3xl font-semibold text-stone-950">
                  {selectedCommodity?.commodity_disp_name ?? "Commodity"}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-600">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-700" />
                    {selectedState?.census_state_name ?? "All India"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-700" />
                    {resolvedWindow.startDate} to {resolvedWindow.endDate}
                  </span>
                </div>
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

          <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="panel panel-strong overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-stone-500">Live prediction</p>
                  <h3 className="mt-2 text-2xl font-semibold text-stone-950">
                    Forecast vs current price
                  </h3>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isRising
                      ? "bg-emerald-100 text-emerald-800"
                      : prediction.status === "ready" && prediction.trend === "down"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {isRising
                    ? "Price may rise"
                    : prediction.status === "ready" && prediction.trend === "down"
                      ? "Price may soften"
                      : "Watchlist"}
                </div>
              </div>

              {prediction.status === "ready" ? (
                <>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-stone-900/8 bg-white px-4 py-4">
                      <p className="eyebrow text-stone-500">Current live</p>
                      <p className="mt-2 text-3xl font-semibold text-stone-950">
                        Rs. {formatNumber(prediction.data.current_price)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-stone-900/8 bg-white px-4 py-4">
                      <p className="eyebrow text-stone-500">Predicted next</p>
                      <p className="mt-2 text-3xl font-semibold text-stone-950">
                        Rs. {formatNumber(prediction.data.predicted_price)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-stone-900/8 bg-white px-4 py-4">
                      <p className="eyebrow text-stone-500">Arrival</p>
                      <p className="mt-2 text-3xl font-semibold text-stone-950">
                        {formatNumber(prediction.data.arrival)}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-5 rounded-3xl border px-5 py-5 ${
                      isRising
                        ? "border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5_0%,#f7fee7_100%)]"
                        : prediction.trend === "down"
                          ? "border-amber-200 bg-[linear-gradient(135deg,#fffbeb_0%,#fff7ed_100%)]"
                          : "border-stone-200 bg-stone-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 rounded-full p-2 ${
                          isRising
                            ? "bg-emerald-600 text-white"
                            : prediction.trend === "down"
                              ? "bg-amber-500 text-white"
                              : "bg-stone-300 text-stone-800"
                        }`}
                      >
                        {isRising ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : prediction.trend === "down" ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-stone-950">
                          {isRising
                            ? "Rising price signal detected"
                            : prediction.trend === "down"
                              ? "Predicted price is slightly lower"
                              : "Predicted price is nearly flat"}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-stone-700">
                          {selectedCommodity?.commodity_disp_name} in{" "}
                          {prediction.data.state} is moving from Rs.{" "}
                          {formatNumber(prediction.data.current_price)} to Rs.{" "}
                          {formatNumber(prediction.data.predicted_price)}.
                          {" "}
                          {isRising
                            ? `That is an expected increase of Rs. ${formatNumber(
                                prediction.change,
                              )} (${formatNumber(prediction.changePercent)}%).`
                            : prediction.trend === "down"
                              ? `That is a projected drop of Rs. ${formatNumber(
                                  Math.abs(prediction.change),
                                )} (${formatNumber(Math.abs(prediction.changePercent))}%).`
                              : "The API is signaling a stable near-term market."}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-6 text-sm leading-7 text-stone-600">
                  {prediction.message}
                </div>
              )}
            </div>

            <div className="panel panel-strong">
              <div className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-emerald-700" />
                <h3 className="text-2xl font-semibold text-stone-950">Trend graph</h3>
              </div>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                Quick comparison of CEDA modal price, live current price, and the
                next predicted price from your live model.
              </p>

              {predictionChart ? (
                <div className="mt-6 rounded-3xl border border-stone-900/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4">
                  <svg
                    aria-label="Prediction trend chart"
                    className="h-auto w-full"
                    viewBox={`0 0 ${predictionChart.width} ${predictionChart.height}`}
                  >
                    <defs>
                      <linearGradient id="predictionArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <line
                      stroke="#e7e5e4"
                      strokeDasharray="6 6"
                      strokeWidth="1"
                      x1={predictionChart.left}
                      x2={predictionChart.width - predictionChart.right}
                      y1={predictionChart.height - predictionChart.bottom}
                      y2={predictionChart.height - predictionChart.bottom}
                    />
                    <line
                      stroke="#f5f5f4"
                      strokeWidth="1"
                      x1={predictionChart.left}
                      x2={predictionChart.width - predictionChart.right}
                      y1={predictionChart.top}
                      y2={predictionChart.top}
                    />
                    <polygon fill="url(#predictionArea)" points={predictionChart.area} />
                    <polyline
                      fill="none"
                      points={predictionChart.polyline}
                      stroke="#0f766e"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="4"
                    />
                    {predictionChart.points.map((point) => (
                      <g key={point.label}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          fill={
                            point.tone === "predicted"
                              ? "#10b981"
                              : point.tone === "current"
                                ? "#0f172a"
                                : "#f59e0b"
                          }
                          r="7"
                        />
                        <text
                          fill="#57534e"
                          fontSize="12"
                          textAnchor="middle"
                          x={point.x}
                          y={predictionChart.height - 16}
                        >
                          {point.label}
                        </text>
                        <text
                          fill="#1c1917"
                          fontSize="13"
                          fontWeight="600"
                          textAnchor="middle"
                          x={point.x}
                          y={point.y - 14}
                        >
                          Rs. {formatNumber(point.value)}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-6 text-sm leading-7 text-stone-600">
                  Graph appears after a commodity and specific state return a live prediction.
                </div>
              )}
            </div>
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

          {prediction.status === "ready" ? (
            <section className="grid gap-4 md:grid-cols-3">
              <div className="panel panel-strong">
                <p className="eyebrow text-stone-500">Prediction gap vs CEDA</p>
                <p className="mt-3 text-3xl font-semibold text-stone-950">
                  Rs.{" "}
                  {formatNumber(
                    prediction.data.predicted_price - (latestPrice?.p_modal ?? 0),
                  )}
                </p>
                <p className="mt-2 text-sm text-stone-600">
                  Predicted next minus official modal price.
                </p>
              </div>
              <div className="panel panel-strong">
                <p className="eyebrow text-stone-500">Current vs CEDA</p>
                <p className="mt-3 text-3xl font-semibold text-stone-950">
                  Rs.{" "}
                  {formatNumber(
                    prediction.data.current_price - (latestPrice?.p_modal ?? 0),
                  )}
                </p>
                <p className="mt-2 text-sm text-stone-600">
                  Live signal compared with the latest official modal price.
                </p>
              </div>
              <div className="panel panel-strong">
                <p className="eyebrow text-stone-500">Action cue</p>
                <p className="mt-3 inline-flex items-center gap-2 text-lg font-semibold text-stone-950">
                  {isRising ? (
                    <>
                      <ArrowUpRight className="h-5 w-5 text-emerald-700" />
                      Watch for upside
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-5 w-5 text-stone-500" />
                      Hold and monitor
                    </>
                  )}
                </p>
                <p className="mt-2 text-sm text-stone-600">
                  Rising items are highlighted above so users can focus quickly.
                </p>
              </div>
            </section>
          ) : null}

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
