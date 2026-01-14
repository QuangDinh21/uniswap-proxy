export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"] || "Content-Type,Authorization"
    );
    if (req.method === "OPTIONS") return res.status(204).end();
  
    const parts = Array.isArray(req.query.path) ? req.query.path : [];
    const restPath = parts.length ? `/${parts.join("/")}` : "";
  
    const queryIndex = (req.url || "").indexOf("?");
    const queryString = queryIndex >= 0 ? (req.url || "").slice(queryIndex) : "";
  
    const upstream = `https://interface.gateway.uniswap.org/v2${restPath}${queryString}`;
  
    try {
      const headers = { origin: "http://localhost:3000" };
      if (req.method === "POST") headers["content-type"] = "application/json";
  
      const upstreamResp = await fetch(upstream, {
        method: req.method,
        headers,
        body: req.method === "POST" ? JSON.stringify(req.body ?? {}) : undefined,
      });
  
      const text = await upstreamResp.text();
      return res.status(upstreamResp.status).send(text);
    } catch (e) {
      return res.status(502).json({ error: "Upstream fetch failed", detail: String(e) });
    }
  }
  