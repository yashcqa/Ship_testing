import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });
copyFileSync("openapi.yaml", "public/openapi.yaml");
console.log("Copied openapi.yaml to public/openapi.yaml");
