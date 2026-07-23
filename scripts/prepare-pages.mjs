import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cnamePath = path.join(rootDir, "CNAME");
const outputPath = path.join(rootDir, "dist", "CNAME");

await fs.copyFile(cnamePath, outputPath);
