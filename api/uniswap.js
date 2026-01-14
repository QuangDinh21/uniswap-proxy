export default async function handler(req, res) {
    // ===== CORS =====
    const origin = req.headers.origin || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,OPTIONS");
  
    const reqHeaders = req.headers["access-control-request-headers"];
    res.setHeader(
      "Access-Control-Allow-Headers",
      reqHeaders || "Content-Type,Authorization"
    );
  
    if (req.method === "OPTIONS") return res.status(204).end();
  
    // ===== Route mapping =====
    const path = req.url || ""; // includes query string
    // Example calls:
    // /api/uniswap/graphql?...  or /api/uniswap/base/...  or /api/uniswap/gateway/...
    const match = path.match(/^\/api\/uniswap\/(graphql|base|gateway)(\/.*)?$/);
  
    if (!match) {
      return res.status(404).json({ error: "Not found" });
    }
  
    const kind = match[1];
    const restPath = match[2] || ""; // may include /xxx
    const queryIndex = path.indexOf("?");
    const queryString = queryIndex >= 0 ? path.slice(queryIndex) : "";
  
    const baseUrl =
      kind === "graphql"
        ? "https://interface.gateway.uniswap.org/v1/graphql"
        : kind === "base"
        ? "https://interface.gateway.uniswap.org"
        : "https://interface.gateway.uniswap.org/v2";
  
    // For graphql endpoint, usually no extra path (but keep generic)
    const upstream = `${baseUrl}${restPath}${queryString}`;
  
    try {
      // ===== Forward to upstream =====
      const headers = {
        // Your requirement:
        origin: "http://localhost:3000",
      };
  
      // forward content-type for JSON bodies
      if (["POST", "PUT", "PATCH"].includes(req.method)) {
        headers["content-type"] = "application/json";
      }
  
      const upstreamResp = await fetch(upstream, {
        method: req.method,
        headers,
        body: ["POST", "PUT", "PATCH"].includes(req.method)
          ? JSON.stringify(req.body ?? {})
          : undefined,
      });
  
      const text = await upstreamResp.text();
      res.status(upstreamResp.status).send(text);
    } catch (e) {
      res.status(502).json({ error: "Upstream fetch failed", detail: String(e) });
    }
  }
  