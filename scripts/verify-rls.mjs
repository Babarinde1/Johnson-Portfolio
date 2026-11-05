// Checks your live Supabase permissions from the outside.
//   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npm run verify-rls
// Optional, to also test the admin: ADMIN_EMAIL=... ADMIN_PASSWORD=...
// It creates one draft row named "rls-test" and deletes it again.
const url = (process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.VITE_SUPABASE_ANON_KEY || "";
if (!url || !key) {
  console.error("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  process.exit(2);
}

let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`,
  );
  if (!ok) failed++;
};
const api = (path, init = {}, token) =>
  fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: key,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
const row = {
  title: "rls-test",
  slug: "rls-test",
  category: "Test",
  status: "In Progress",
  summary: "x",
  description: "x",
  visibility: "draft",
};

// Anonymous visitor
let r = await api("/rest/v1/projects?select=slug,visibility");
const rows = r.ok ? await r.json() : [];
check("anon can read projects", r.ok, `status ${r.status}`);
check(
  "anon sees ONLY published rows",
  rows.every((x) => x.visibility === "published"),
  `${rows.length} rows`,
);
r = await api("/rest/v1/projects", {
  method: "POST",
  headers: { Prefer: "return=minimal" },
  body: JSON.stringify(row),
});
check("anon cannot insert", !r.ok, `status ${r.status}`);
r = await api("/rest/v1/projects?slug=eq.nonexistent", {
  method: "PATCH",
  headers: { Prefer: "return=representation" },
  body: JSON.stringify({ title: "x" }),
});
check(
  "anon cannot update",
  !r.ok || (await r.json()).length === 0,
  `status ${r.status}`,
);
r = await api("/rest/v1/projects?slug=eq.nonexistent", {
  method: "DELETE",
  headers: { Prefer: "return=representation" },
});
check(
  "anon cannot delete",
  !r.ok || (await r.json()).length === 0,
  `status ${r.status}`,
);

// Administrator
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  r = await api("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    }),
  });
  const session = r.ok ? await r.json() : null;
  check("admin can sign in", Boolean(session), `status ${r.status}`);
  if (session) {
    const t = session.access_token;
    r = await api(
      "/rest/v1/projects",
      {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(row),
      },
      t,
    );
    check("admin can insert a draft", r.ok, `status ${r.status}`);
    r = await api(
      "/rest/v1/projects",
      {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          ...row,
          slug: "rls-bad",
          live_url: "javascript:alert(1)",
        }),
      },
      t,
    );
    check("database rejects non-https URLs", !r.ok, `status ${r.status}`);
    r = await api(
      "/rest/v1/projects?slug=eq.rls-test&select=slug,visibility",
      {},
      t,
    );
    check("admin can read drafts", r.ok && (await r.json()).length === 1);
    r = await api(
      "/rest/v1/projects?slug=eq.rls-test&select=slug",
      {},
      undefined,
    );
    check("anon cannot see that draft", r.ok && (await r.json()).length === 0);
    r = await api(
      "/rest/v1/projects?slug=eq.rls-test",
      { method: "DELETE", headers: { Prefer: "return=minimal" } },
      t,
    );
    check("admin can delete (clean-up)", r.ok, `status ${r.status}`);
  }
} else
  console.log(
    "SKIP  admin checks (set ADMIN_EMAIL and ADMIN_PASSWORD to run them)",
  );

console.log(
  failed
    ? `\n${failed} check(s) FAILED. Do not deploy the CMS until these pass.`
    : "\nAll checks passed.",
);
process.exit(failed ? 1 : 0);
