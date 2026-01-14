export default async function handler(req, res) {
  // Force CORS on every response
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // Handle preflight - use 200 not 204
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const upstreamResp = await fetch(
      "https://interface.gateway.uniswap.org/v1/graphql",
      {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          "content-type": "application/json",
        },
        body: JSON.stringify(req.body ?? {}),
      }
    );

    const text = await upstreamResp.text();
    res.setHeader("Content-Type", "application/json");
    return res.status(upstreamResp.status).send(text);
  } catch (e) {
    return res.status(502).json({ error: "Upstream fetch failed", detail: String(e) });
  }
}


  