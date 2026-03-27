import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getWeather } from "@/lib/weather";
import { getRecommendedPrice } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    const { crop, location } = await req.json();

    // 🔍 DEBUG START (ADD THIS)
    const db = await getDatabase();
    const data = await db.collection("prices").find().limit(5).toArray();
    console.log("DB DATA:", data);
    // 🔍 DEBUG END

    const price = await getRecommendedPrice(crop);
    const weather = await getWeather(location);

    return NextResponse.json({
      recommendedPrice: price,
      weather,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch price" },
      { status: 500 }
    );
  }
}