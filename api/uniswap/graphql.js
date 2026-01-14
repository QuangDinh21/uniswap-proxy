export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || "Content-Type,Authorization"
  );
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const upstream = "https://interface.gateway.uniswap.org/v1/graphql";

  try {
    const upstreamResp = await fetch(upstream, {
      method: "POST",
      headers: {
        origin: "http://localhost:3000", // your requirement (upstream request header)
        "content-type": "application/json",
      },
      body: JSON.stringify(req.body ?? {}),
    });

    const text = await upstreamResp.text();
    return res.status(upstreamResp.status).send(text);
  } catch (e) {
    return res.status(502).json({ error: "Upstream fetch failed", detail: String(e) });
  }
}

  