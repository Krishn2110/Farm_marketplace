import "server-only";

type LivePredictionResponse = {
  commodity: string;
  state: string;
  current_price: number;
  predicted_price: number;
  arrival: number;
};

type LivePredictionResult =
  | {
      status: "ready";
      data: LivePredictionResponse;
      change: number;
      changePercent: number;
      trend: "up" | "down" | "flat";
    }
  | {
      status: "idle" | "error";
      message: string;
    };

const predictionApiUrl =
  process.env.PRICE_PREDICTION_API_URL ??
  "https://smart-price-prediction.onrender.com/predict-live";

function getTrend(change: number): "up" | "down" | "flat" {
  if (change > 0.5) {
    return "up";
  }

  if (change < -0.5) {
    return "down";
  }

  return "flat";
}

export async function getLivePricePrediction(input: {
  commodity?: string;
  state?: string;
}) {
  if (!input.commodity || !input.state || input.state === "All India") {
    return {
      status: "idle",
      message: "Select a commodity and state to load the live prediction.",
    } satisfies LivePredictionResult;
  }

  try {
    const response = await fetch(predictionApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        commodity: input.commodity,
        state: input.state,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Prediction request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as LivePredictionResponse;
    const change = data.predicted_price - data.current_price;
    const changePercent =
      data.current_price > 0 ? (change / data.current_price) * 100 : 0;

    return {
      status: "ready",
      data,
      change,
      changePercent,
      trend: getTrend(change),
    } satisfies LivePredictionResult;
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Live prediction service is unavailable right now.",
    } satisfies LivePredictionResult;
  }
}

export type { LivePredictionResponse, LivePredictionResult };
