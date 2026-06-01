import fs from "fs/promises";
import path from "path";

const API_DIR = path.join(process.cwd(), "app", "api");
const LIB_DIR = path.join(process.cwd(), "app", "lib");

async function walk(dir) {
  let results = [];
  const list = await fs.readdir(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(await walk(filePath));
    } else {
      if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
        results.push(filePath);
      }
    }
  }
  return results;
}

async function fix() {
  // Create shared redis client
  const redisLib = `import { Redis } from "@upstash/redis";

const redisUrl = process.env.REDIS_KV_REST_API_URL || process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.REDIS_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = new Redis({
  url: redisUrl || "",
  token: redisToken || "",
});
`;
  await fs.writeFile(path.join(LIB_DIR, "redis.ts"), redisLib);

  // Fix API and lib files
  const files = [...(await walk(API_DIR)), path.join(LIB_DIR, "admin-auth.ts")];
  
  for (const file of files) {
    let content = await fs.readFile(file, "utf8");
    if (content.includes('import { Redis } from "@upstash/redis";')) {
      content = content.replace('import { Redis } from "@upstash/redis";', 'import { redis } from "@/app/lib/redis";');
      content = content.replace(/const redis = Redis\.fromEnv\(\);/g, "");
      await fs.writeFile(file, content);
      console.log("Fixed", file);
    }
  }
}

fix();
