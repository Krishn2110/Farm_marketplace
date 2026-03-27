import "server-only";

type Commodity = {
  category_id: number;
  commodity_id: number;
  commodity_disp_name: string;
};

type StateOption = {
  census_state_id: number;
  census_state_name: string;
};

type PricePoint = {
  t: string;
  cmdty: string;
  p_min?: number;
  p_max?: number;
  p_modal?: number;
};

type QuantityPoint = {
  t: string;
  cmdty: string;
  qty?: number;
};

const publicBaseUrl =
  process.env.CEDA_PUBLIC_BASE_URL ?? "https://agmarknet.ceda.ashoka.edu.in";
const apiKey = process.env.CEDA_API_KEY ?? "";

function getAuthHeaders(contentType = false) {
  const headers: Record<string, string> = {
    Origin: publicBaseUrl,
    Referer: `${publicBaseUrl}/`,
  };

  if (contentType) {
    headers["Content-Type"] = "application/json";
  }

  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  return headers;
}

async function readJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`CEDA request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function getCedaCommodities() {
  const result = await readJson<{ data: Commodity[] }>(
    `${publicBaseUrl}/api/commodities`,
    {
      headers: getAuthHeaders(),
    },
  );

  return result.data;
}

export async function getCedaStates() {
  const result = await readJson<{ data: StateOption[] }>(
    `${publicBaseUrl}/api/states`,
    {
      headers: getAuthHeaders(),
    },
  );

  return result.data;
}

export async function getCedaPrices(input: {
  commodityId: number;
  stateId?: number;
  districtId?: number;
  calculationType?: "d" | "m" | "y";
  startDate: string;
  endDate: string;
}) {
  const result = await readJson<{ data: PricePoint[]; error?: string; status?: number }>(
    `${publicBaseUrl}/api/prices`,
    {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        commodity_id: input.commodityId,
        state_id: input.stateId ?? 0,
        district_id: input.districtId ?? 0,
        calculation_type: input.calculationType ?? "m",
        start_date: input.startDate,
        end_date: input.endDate,
      }),
    },
  );

  return result.data ?? [];
}

export async function getCedaQuantities(input: {
  commodityId: number;
  stateId?: number;
  districtId?: number;
  calculationType?: "d" | "m" | "y";
  startDate: string;
  endDate: string;
}) {
  const result = await readJson<{ data: QuantityPoint[]; error?: string; status?: number }>(
    `${publicBaseUrl}/api/quantities`,
    {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        commodity_id: input.commodityId,
        state_id: input.stateId ?? 0,
        district_id: input.districtId ?? 0,
        calculation_type: input.calculationType ?? "m",
        start_date: input.startDate,
        end_date: input.endDate,
      }),
    },
  );

  return result.data ?? [];
}

export type { Commodity, PricePoint, QuantityPoint, StateOption };
