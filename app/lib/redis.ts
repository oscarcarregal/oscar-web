import { Redis } from "@upstash/redis";

const redisUrl = process.env.REDIS_KV_REST_API_URL || process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.REDIS_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = new Redis({
  url: redisUrl || "",
  token: redisToken || "",
});
