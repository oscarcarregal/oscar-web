import { config } from "dotenv";
config({ path: ".env.local" });
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_KV_REST_API_URL || "",
  token: process.env.REDIS_KV_REST_API_TOKEN || "",
});

async function main() {
  try {
    const config = await redis.get("site:config");
    console.log(JSON.stringify(config, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
