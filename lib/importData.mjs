import fs from "fs";
import csv from "csv-parser";
import { MongoClient } from "mongodb";



const uri = process.env.MONGODB_URI||"mongodb+srv://thakorrajta859_db_user:Rajat_5119@cluster0.2mvxwqh.mongodb.net/";

console.log(uri)

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

const client = new MongoClient(uri);

const importData = async () => {
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || "farm_marketplace");
    const collection = db.collection("prices");

    const results = [];

    fs.createReadStream(new URL("./clean_mandi.csv", import.meta.url))
      .pipe(csv())
      .on("data", (row) => {
        const parsed = {
          crop: row.crop?.toLowerCase().trim(),
          location: row.location?.toLowerCase().trim(),
          date: new Date(row.date),
          price: parseFloat(row.price),
          arrival: parseFloat(row.arrival),
        };

        if (!parsed.crop || isNaN(parsed.price)) return;

        console.log("Parsed:", parsed);
        results.push(parsed);
      })
      .on("end", async () => {
        console.log("Total rows:", results.length);

        if (results.length > 0) {
          await collection.deleteMany({});
          await collection.insertMany(results);

          console.log("✅ Data Imported Successfully:", results.length);
        } else {
          console.log("⚠️ No data parsed");
        }

        await client.close();
      });

  } catch (err) {
    console.error("❌ Import Error:", err);
  }
};

importData();