export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"] || "Content-Type,Authorization"
    );
    if (req.method === "OPTIONS") return res.status(204).end();
  
    // Parse URL directly instead of relying on req.query.path
    const url = req.url || "";
    
    // Remove the /api/uniswap/gateway prefix to get the rest
    const match = url.match(/^\/api\/uniswap\/gateway(\/[^?]*)?(\?.*)?$/);
    
    const restPath = match?.[1] || "";  // e.g., "/quickroute"
    const queryString = match?.[2] || ""; // e.g., "?tokenInChainId=1&..."
    
    // Remove [...path] from query string if it leaked in
    const cleanQuery = queryString.replace(/&?\[\.\.\.path\]=[^&]*/g, "").replace(/^\?&/, "?");
  
    const upstream = `https://interface.gateway.uniswap.org/v2${restPath}${cleanQuery}`;
  
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
  