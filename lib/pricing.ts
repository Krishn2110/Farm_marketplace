// lib/pricing.ts
import { getDatabase } from "./mongodb";

export const getRecommendedPrice = async (crop: string) => {
  const db = await getDatabase();

  const data = await db
    .collection("prices")
    .find({
      crop: crop.toLowerCase().trim()
    })
    .sort({ date: -1 })
    .limit(5)
    .toArray();

  if (data.length === 0) return 0;

  const total = data.reduce(
    (sum, item) => sum + item.price / (item.arrival || 1),
    0
  );

  const weight = data.reduce(
    (sum, item) => sum + 1 / (item.arrival || 1),
    0
  );

  return total / weight;
};