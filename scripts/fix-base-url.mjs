import fs from "fs/promises";
import path from "path";

const dirsToScan = [
  path.join(process.cwd(), "app", "api"),
  path.join(process.cwd(), "app", "lib")
];

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
  let files = [];
  for (const dir of dirsToScan) {
    files = files.concat(await walk(dir));
  }
  
  for (const file of files) {
    let content = await fs.readFile(file, "utf8");
    const target = 'process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"';
    if (content.includes(target)) {
      const replacement = 'process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")';
      content = content.replace(new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
      await fs.writeFile(file, content);
      console.log("Fixed", file);
    }
  }
}

fix();
