import fs from "node:fs";
const files = ["src", "supabase"];
const forbidden = [
  /service_role/i,
  /SUPABASE_SERVICE_ROLE_KEY/i,
  /secret_access_key/i,
];
const hits = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(file);
    else if (/\.(tsx?|sql|js|mjs)$/.test(entry.name)) {
      const text = fs.readFileSync(file, "utf8");
      for (const pattern of forbidden)
        if (pattern.test(text)) hits.push(`${file}: matched ${pattern}`);
    }
  }
}
files.forEach(walk);
if (hits.length) {
  console.error("Potential secret reference found:\n" + hits.join("\n"));
  process.exit(1);
}
console.log(
  "No obvious service-role or secret-key references found in source. This static check is not a full security audit.",
);
